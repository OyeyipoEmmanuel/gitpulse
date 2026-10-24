import { supabase } from "./supabase"

export type AccountAction = "disconnect" | "delete-account"

export class AccountActionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AccountActionError"
  }
}

export async function performAccountAction(action: AccountAction) {
  const { data, error } = await supabase.functions.invoke("account-actions", {
    body: {
      action,
      ...(action === "delete-account" ? { confirmation: "DELETE" } : {}),
    },
  })

  if (error) {
    throw new AccountActionError(
      action === "disconnect"
        ? "GitHub could not be disconnected. Please try again."
        : "Your account could not be fully deleted. Please retry or contact support.",
    )
  }

  if (!data?.success) {
    throw new AccountActionError(data?.error || "The account action could not be completed.")
  }
}

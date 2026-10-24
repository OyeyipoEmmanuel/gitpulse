import { beforeEach, describe, expect, it, vi } from "vitest"
import { AccountActionError, performAccountAction } from "./accountActions"

const mocks = vi.hoisted(() => ({ invoke: vi.fn() }))

vi.mock("./supabase", () => ({ supabase: { functions: { invoke: mocks.invoke } } }))

describe("account actions", () => {
  beforeEach(() => vi.clearAllMocks())

  it("requests a GitHub disconnect through the protected Edge Function", async () => {
    mocks.invoke.mockResolvedValue({ data: { success: true }, error: null })

    await expect(performAccountAction("disconnect")).resolves.toBeUndefined()

    expect(mocks.invoke).toHaveBeenCalledWith("account-actions", { body: { action: "disconnect" } })
  })

  it("adds server-side confirmation to account deletion", async () => {
    mocks.invoke.mockResolvedValue({ data: { success: true }, error: null })

    await performAccountAction("delete-account")

    expect(mocks.invoke).toHaveBeenCalledWith("account-actions", {
      body: { action: "delete-account", confirmation: "DELETE" },
    })
  })

  it("returns a safe user-facing error when the function fails", async () => {
    mocks.invoke.mockResolvedValue({ data: null, error: new Error("internal details") })

    await expect(performAccountAction("disconnect")).rejects.toEqual(expect.any(AccountActionError))
    await expect(performAccountAction("disconnect")).rejects.not.toThrow("internal details")
  })
})

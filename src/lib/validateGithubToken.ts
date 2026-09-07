import type { User } from "@supabase/supabase-js"
import { GitHubReconnectError } from "./authErrors"

export async function validateGithubToken(token: string, user: User, signal: AbortSignal) {
  const response = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    signal,
  })
  if (response.status === 401) throw new GitHubReconnectError()
  if (!response.ok) throw new Error("GitHub could not verify your connection. Please try again shortly.")

  const profile: { id?: number; login?: string } = await response.json()
  const identity = user.identities?.find(value => value.provider === "github")?.identity_data
  const expectedId = identity?.provider_id ?? identity?.sub ?? user.user_metadata.provider_id ?? user.user_metadata.sub
  const expectedLogin = identity?.user_name ?? user.user_metadata.user_name
  const matches = expectedId != null
    ? profile.id != null && String(profile.id) === String(expectedId)
    : typeof expectedLogin === "string" && profile.login?.toLowerCase() === expectedLogin.toLowerCase()
  if (!matches) throw new GitHubReconnectError()
}

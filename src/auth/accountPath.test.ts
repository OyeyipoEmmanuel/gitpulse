import type { User } from "@supabase/supabase-js"
import { describe, expect, it } from "vitest"
import { accountPath, hasOAuthError } from "./accountPath"

describe("OAuth callback routing", () => {
  it.each(["?error=access_denied", "?error_description=denied", "?error_code=123"])("recognizes %s", search => {
    expect(hasOAuthError(search, "")).toBe(true)
  })
  it("recognizes fragment-based errors without displaying raw provider text", () => {
    expect(hasOAuthError("", "#error=access_denied&error_description=private-details")).toBe(true)
  })
  it("does not mistake a successful code callback for an error", () => {
    expect(hasOAuthError("?code=test-code", "")).toBe(false)
  })
  it("routes a GitHub user to account selection", () => {
    const user: User = { id: "id", user_metadata: { user_name: "alice" }, app_metadata: {}, aud: "authenticated", created_at: "2026-01-01" }
    expect(accountPath(user)).toBe("/alice/select-account")
  })
  it("has a safe fallback when the GitHub login is missing", () => {
    const user: User = { id: "id", user_metadata: {}, app_metadata: {}, aud: "authenticated", created_at: "2026-01-01" }
    expect(accountPath(user)).toBe("/id/select-account")
  })
})

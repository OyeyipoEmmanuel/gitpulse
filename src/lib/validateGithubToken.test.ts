import type { User } from "@supabase/supabase-js"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { validateGithubToken } from "./validateGithubToken"
import { GitHubReconnectError } from "./authErrors"

const user: User = {
  id: "supabase-user", aud: "authenticated", created_at: "2026-01-01", app_metadata: {},
  user_metadata: { provider_id: "123", user_name: "alice" },
}
const signal = new AbortController().signal

describe("GitHub token verification", () => {
  const fetchMock = vi.fn()
  beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal("fetch", fetchMock) })
  afterEach(() => vi.unstubAllGlobals())

  it("accepts the matching immutable GitHub ID even after a login rename", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 123, login: "renamed" })))
    await expect(validateGithubToken("token", user, signal)).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith("https://api.github.com/user", expect.objectContaining({
      headers: { Authorization: "Bearer token", Accept: "application/vnd.github+json" }, signal,
    }))
  })

  it("rejects a different GitHub account even if its login matches metadata", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 456, login: "alice" })))
    await expect(validateGithubToken("token", user, signal)).rejects.toBeInstanceOf(GitHubReconnectError)
  })

  it("uses a case-insensitive login only when an immutable ID is unavailable", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 123, login: "ALICE" })))
    await expect(validateGithubToken("token", { ...user, user_metadata: { user_name: "alice" } }, signal)).resolves.toBeUndefined()
  })

  it("fails closed when no GitHub identity can be matched", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 123, login: "alice" })))
    await expect(validateGithubToken("token", { ...user, user_metadata: {} }, signal)).rejects.toBeInstanceOf(GitHubReconnectError)
  })

  it("requires reconnect for unauthorized credentials", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }))
    await expect(validateGithubToken("token", user, signal)).rejects.toBeInstanceOf(GitHubReconnectError)
  })

  it.each([403, 429, 500])("does not mistake HTTP %i for revoked credentials", async (status) => {
    fetchMock.mockResolvedValue(new Response(null, { status }))
    await expect(validateGithubToken("token", user, signal)).rejects.not.toBeInstanceOf(GitHubReconnectError)
  })

  it("propagates network failure for a retry rather than invalidating credentials", async () => {
    fetchMock.mockRejectedValue(new TypeError("Network unavailable"))
    await expect(validateGithubToken("token", user, signal)).rejects.toBeInstanceOf(TypeError)
  })
})

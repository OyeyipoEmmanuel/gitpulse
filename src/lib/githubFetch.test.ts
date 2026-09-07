import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { githubAllPages, githubFetch } from "./githubFetch"
import { AuthSessionChangedError, GitHubReconnectError } from "./authErrors"
import { GitHubApiError, GitHubRateLimitError } from "./githubErrors"

const auth = vi.hoisted(() => ({
  session: { user: { id: "a" } } as { user: { id: string } } | null,
  providerToken: "a-token" as string | null, tokenStatus: "ready", signingOut: false, revision: 1,
  invalidateProviderToken: vi.fn(),
}))
vi.mock("../store/authStore", () => ({ useAuthStore: { getState: () => auth } }))

describe("authenticated GitHub requests", () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    Object.assign(auth, { session: { user: { id: "a" } }, providerToken: "a-token", tokenStatus: "ready", signingOut: false, revision: 1 })
    auth.invalidateProviderToken.mockReset()
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it("adds authentication without losing method, body, or cancellation", async () => {
    const response = new Response("{}")
    fetchMock.mockResolvedValue(response)
    const signal = new AbortController().signal
    await expect(githubFetch("https://api.github.com/graphql", "a-token", {
      method: "POST", body: "{}", signal, headers: { "Content-Type": "application/json" },
    })).resolves.toBe(response)
    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(init).toMatchObject({ method: "POST", body: "{}", signal })
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer a-token")
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json")
  })

  it("refuses to send credentials to an unexpected origin", async () => {
    await expect(githubFetch("https://example.com/user", "a-token")).rejects.toThrow("origin")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("does not send a request with an old account token", async () => {
    await expect(githubFetch("https://api.github.com/user", "old-token")).rejects.toBeInstanceOf(AuthSessionChangedError)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("invalidates the current token on HTTP 401", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }))
    await expect(githubFetch("https://api.github.com/user", "a-token")).rejects.toBeInstanceOf(GitHubReconnectError)
    expect(auth.invalidateProviderToken).toHaveBeenCalledExactlyOnceWith("a-token")
  })

  it.each([403, 404, 500])("reports HTTP %i without revoking auth", async (status) => {
    fetchMock.mockResolvedValue(new Response(null, { status }))
    await expect(githubFetch("https://api.github.com/user", "a-token")).rejects.toMatchObject({ status })
    expect(auth.invalidateProviderToken).not.toHaveBeenCalled()
  })

  it.each([403, 429])("reports a rate limit on HTTP %i without revoking auth", async (status) => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "API rate limit exceeded" }), {
      status,
      headers: { "content-type": "application/json", "x-ratelimit-remaining": "0" },
    }))
    await expect(githubFetch("https://api.github.com/user", "a-token")).rejects.toBeInstanceOf(GitHubRateLimitError)
    expect(auth.invalidateProviderToken).not.toHaveBeenCalled()
  })

  it("collects every REST page", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 1 }]), {
        headers: { link: '<https://api.github.com/user/orgs?page=2>; rel="next"' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 2 }])))
    await expect(githubAllPages<{ id: number }>("https://api.github.com/user/orgs?per_page=100", "a-token"))
      .resolves.toEqual([{ id: 1 }, { id: 2 }])
  })

  it("rejects non-array paginated responses", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ items: [] })))
    await expect(githubAllPages("https://api.github.com/user/orgs", "a-token")).rejects.toBeInstanceOf(GitHubApiError)
  })

  it.each([200, 401])("discards a late HTTP %i response after account switching", async (status) => {
    fetchMock.mockImplementation(async () => {
      auth.revision++
      auth.providerToken = "b-token"
      return new Response("{}", { status })
    })
    await expect(githubFetch("https://api.github.com/user", "a-token")).rejects.toBeInstanceOf(AuthSessionChangedError)
    expect(auth.invalidateProviderToken).not.toHaveBeenCalled()
  })

  it("discards responses that arrive during logout", async () => {
    fetchMock.mockImplementation(async () => {
      auth.signingOut = true
      return new Response("{}")
    })
    await expect(githubFetch("https://api.github.com/user", "a-token")).rejects.toBeInstanceOf(AuthSessionChangedError)
  })
})

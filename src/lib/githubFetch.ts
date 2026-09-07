import { useAuthStore } from "../store/authStore"
import { AuthSessionChangedError, GitHubReconnectError } from "./authErrors"
import { GitHubApiError, GitHubRateLimitError } from "./githubErrors"

export async function githubFetch(url: string, token: string, init: RequestInit = {}) {
  if (new URL(url).origin !== "https://api.github.com") throw new Error("Unexpected GitHub API origin")
  const initial = useAuthStore.getState()
  const assertCurrent = () => {
    const current = useAuthStore.getState()
    if (!current.session || current.signingOut || current.tokenStatus !== "ready" ||
        current.providerToken !== token || current.revision !== initial.revision) {
      throw new AuthSessionChangedError()
    }
  }
  assertCurrent()
  const headers = new Headers(init.headers)
  headers.set("Authorization", `Bearer ${token}`)
  headers.set("Accept", "application/vnd.github+json")
  const response = await fetch(url, { ...init, headers })
  assertCurrent()
  if (response.status === 401) {
    useAuthStore.getState().invalidateProviderToken(token)
    throw new GitHubReconnectError()
  }
  if (!response.ok) {
    let apiMessage = ""
    try {
      const body = await response.clone().json() as { message?: unknown }
      if (typeof body.message === "string") apiMessage = body.message
    } catch { /* GitHub may return an empty or non-JSON error response. */ }

    const remaining = response.headers.get("x-ratelimit-remaining")
    const retryAfter = response.headers.get("retry-after")
    const isRateLimit = response.status === 429 ||
      (response.status === 403 && (remaining === "0" || retryAfter !== null || /rate limit/i.test(apiMessage)))

    if (isRateLimit) {
      const resetSeconds = Number(response.headers.get("x-ratelimit-reset"))
      const resetAt = Number.isFinite(resetSeconds) && resetSeconds > 0
        ? new Date(resetSeconds * 1000)
        : null
      throw new GitHubRateLimitError(
        resetAt
          ? `GitHub's API rate limit has been reached. Try again after ${resetAt.toLocaleString()}.`
          : "GitHub's API rate limit has been reached. Please try again later.",
        response.status,
        resetAt,
      )
    }

    throw new GitHubApiError(
      apiMessage || `GitHub request failed with status ${response.status}.`,
      response.status,
    )
  }
  return response
}

export async function githubJson<T>(url: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await githubFetch(url, token, init)
  try {
    return await response.json() as T
  } catch {
    throw new GitHubApiError("GitHub returned an invalid JSON response.", response.status)
  }
}

function nextPageUrl(linkHeader: string | null): string | null {
  if (!linkHeader) return null
  for (const part of linkHeader.split(",")) {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/)
    if (match?.[2] === "next") return match[1]
  }
  return null
}

export async function githubAllPages<T>(url: string, token: string, maxPages = 10): Promise<T[]> {
  const items: T[] = []
  let next: string | null = url
  let page = 0
  while (next && page < maxPages) {
    const response = await githubFetch(next, token)
    const body = await response.json() as unknown
    if (!Array.isArray(body)) throw new GitHubApiError("GitHub returned an invalid paginated response.", response.status)
    items.push(...body as T[])
    next = nextPageUrl(response.headers.get("link"))
    page++
  }
  if (next) throw new GitHubApiError("GitHub returned more pages than this request can safely process.", 200)
  return items
}

import { QueryClient } from "@tanstack/react-query"
import { AuthSessionChangedError, GitHubReconnectError } from "./authErrors"
import { GitHubApiError, GitHubGraphQLError, GitHubRateLimitError } from "./githubErrors"

export const GITHUB_DATA_STALE_TIME = 5 * 60 * 1000
export const GITHUB_DATA_GC_TIME = 30 * 60 * 1000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: GITHUB_DATA_STALE_TIME,
      gcTime: GITHUB_DATA_GC_TIME,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof GitHubReconnectError || error instanceof AuthSessionChangedError ||
            error instanceof GitHubRateLimitError || error instanceof GitHubGraphQLError) return false
        if (error instanceof GitHubApiError && error.status < 500) return false
        return failureCount < 3
      },
    },
  },
})

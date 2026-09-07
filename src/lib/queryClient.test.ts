import { describe, expect, it } from "vitest"
import { GITHUB_DATA_GC_TIME, GITHUB_DATA_STALE_TIME, queryClient } from "./queryClient"

describe("shared query policy", () => {
    it("uses one bounded freshness policy for GitHub-backed screens", () => {
        const defaults = queryClient.getDefaultOptions().queries

        expect(defaults?.staleTime).toBe(GITHUB_DATA_STALE_TIME)
        expect(defaults?.gcTime).toBe(GITHUB_DATA_GC_TIME)
        expect(defaults?.refetchOnWindowFocus).toBe(false)
        expect(GITHUB_DATA_STALE_TIME).toBe(5 * 60 * 1000)
    })
})

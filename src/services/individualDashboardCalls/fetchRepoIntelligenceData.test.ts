import { describe, expect, it } from "vitest"
import { buildStarGrowthBatch } from "./fetchRepoIntelligenceData"

describe("repository star-history batching", () => {
    it("combines repository pages into one aliased GraphQL operation", () => {
        const result = buildStarGrowthBatch([
            { id: "repo-a", cursor: null },
            { id: "repo-b", cursor: "cursor-b" },
        ])

        expect(result.query).toContain("repo0: node(id: $id0)")
        expect(result.query).toContain("repo1: node(id: $id1)")
        expect(result.query).toContain("after: $cursor1")
        expect(result.variables).toEqual({
            id0: "repo-a",
            cursor0: null,
            id1: "repo-b",
            cursor1: "cursor-b",
        })
    })
})

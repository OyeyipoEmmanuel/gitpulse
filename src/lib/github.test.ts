import { beforeEach, describe, expect, it, vi } from "vitest"
import { fetchGraphQL, fetchGraphQLConnection } from "./github"
import { GitHubDataError, GitHubGraphQLError, GitHubRateLimitError } from "./githubErrors"
import { githubFetch } from "./githubFetch"

vi.mock("./githubFetch", () => ({ githubFetch: vi.fn() }))
const fetchMock = vi.mocked(githubFetch)

describe("GitHub GraphQL", () => {
  beforeEach(() => fetchMock.mockReset())

  it("returns complete data", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ data: { viewer: { login: "octo" } } })))
    await expect(fetchGraphQL("query", {}, "token")).resolves.toEqual({ viewer: { login: "octo" } })
  })

  it("rejects GraphQL errors instead of returning partial data", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      data: { viewer: null }, errors: [{ message: "Field failed", type: "FORBIDDEN" }],
    })))
    await expect(fetchGraphQL("query", {}, "token")).rejects.toBeInstanceOf(GitHubGraphQLError)
  })

  it("identifies GraphQL rate limits", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ errors: [{ message: "rate limit", type: "RATE_LIMITED" }] })))
    await expect(fetchGraphQL("query", {}, "token")).rejects.toBeInstanceOf(GitHubRateLimitError)
  })

  it("rejects a missing data payload", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({})))
    await expect(fetchGraphQL("query", {}, "token")).rejects.toBeInstanceOf(GitHubDataError)
  })

  it("follows GraphQL connection cursors and joins nodes", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { list: {
        nodes: [{ id: 1 }], pageInfo: { hasNextPage: true, endCursor: "next" },
      } } })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { list: {
        nodes: [{ id: 2 }], pageInfo: { hasNextPage: false, endCursor: null },
      } } })))
    type Data = { list: { nodes: { id: number }[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } }
    const result = await fetchGraphQLConnection<Data, { id: number }>("query", {}, "token", data => data.list)
    expect(result.nodes).toEqual([{ id: 1 }, { id: 2 }])
    expect(JSON.parse((fetchMock.mock.calls[1][2] as RequestInit).body as string).variables.cursor).toBe("next")
  })
})

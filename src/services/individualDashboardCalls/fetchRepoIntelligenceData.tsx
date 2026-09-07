import { fetchGraphQL, fetchGraphQLConnection, type GraphQLConnection } from "@/lib/github"
import { GitHubDataError } from "@/lib/githubErrors"
import { useAuthStore } from "@/store/authStore"
import { useQuery } from "@tanstack/react-query"
import type { RepositoryNode, StargazerEdge } from "@/types"

const OVERVIEW_QUERY = `
query($username: String!, $since: GitTimestamp!, $cursor: String) {
  user(login: $username) {
    repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}, after: $cursor) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        diskUsage
        stargazerCount
        forkCount
        primaryLanguage { name color }
        pullRequests { totalCount }
        licenseInfo { name }
        updatedAt
        object(expression: "HEAD:README.md") { 
          ... on Blob { text }
        }
        defaultBranchRef {
          target {
            ... on Commit {
              history(since: $since) { totalCount }
            }
          }
        }
      }
    }
  }
}
`

const STAR_BATCH_SIZE = 10

interface PendingStarPage {
  id: string
  cursor: string | null
}

type StarConnection = {
  edges: StargazerEdge[]
  pageInfo: { hasNextPage: boolean; endCursor: string | null }
}

type StarBatchData = Record<string, null | { stargazers: StarConnection }>

export function buildStarGrowthBatch(items: PendingStarPage[]) {
  const definitions = items.flatMap((_, index) => [`$id${index}: ID!`, `$cursor${index}: String`]).join(", ")
  const fields = items.map((_, index) => `
    repo${index}: node(id: $id${index}) {
      ... on Repository {
        stargazers(first: 100, after: $cursor${index}, orderBy: {field: STARRED_AT, direction: DESC}) {
          pageInfo { hasNextPage endCursor }
          edges { starredAt }
        }
      }
    }`).join("\n")
  const variables = Object.fromEntries(items.flatMap((item, index) => [
    [`id${index}`, item.id],
    [`cursor${index}`, item.cursor],
  ]))

  return { query: `query(${definitions}) {${fields}\n}`, variables }
}

export const fetchRepoIntelligenceDatas = async (username: string, token: string) => {
  const since = new Date()
  since.setDate(since.getDate() - 30)

  type OverviewData = { user: null | { repositories: GraphQLConnection<RepositoryNode> & { totalCount: number } } }
  const overviewResult = await fetchGraphQLConnection<OverviewData, RepositoryNode>(
    OVERVIEW_QUERY,
    { username, since: since.toISOString() },
    token,
    data => data.user?.repositories,
  )
  const firstUser = overviewResult.firstPage.user
  if (!firstUser) throw new GitHubDataError("The requested GitHub user could not be found.")
  const overview = {
    ...overviewResult.firstPage,
    user: {
      ...firstUser,
      repositories: { ...firstUser.repositories, nodes: overviewResult.nodes },
    },
  }

  const repos = overview.user.repositories.nodes
    .filter(repo => repo.stargazerCount > 0)

  const starDates: string[] = []
  let pending: PendingStarPage[] = repos.map(repo => ({ id: repo.id, cursor: null }))
  while (pending.length > 0) {
    const next: PendingStarPage[] = []
    for (let offset = 0; offset < pending.length; offset += STAR_BATCH_SIZE) {
      const batch = pending.slice(offset, offset + STAR_BATCH_SIZE)
      const { query, variables } = buildStarGrowthBatch(batch)
      const page = await fetchGraphQL<StarBatchData>(query, variables, token)

      batch.forEach((item, index) => {
        // A repository can disappear between the overview and this follow-up.
        // Keep the remaining repositories available if that happens.
        const connection = page[`repo${index}`]?.stargazers
        if (!connection) return
        const recentEdges = connection.edges.filter(edge => new Date(edge.starredAt) >= since)
        starDates.push(...recentEdges.map(edge => edge.starredAt))
        if (!connection.pageInfo.hasNextPage || recentEdges.length < connection.edges.length) return
        const cursor = connection.pageInfo.endCursor
        if (!cursor || cursor === item.cursor) throw new GitHubDataError("GitHub returned invalid pagination metadata.")
        next.push({ id: item.id, cursor })
      })
    }
    pending = next
  }

  const allStarDates = starDates
    .reduce((acc: Record<string, number>, date: string) => {
      const day = date.slice(0, 10)
      acc[day] = (acc[day] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)

  const starsByDay = Object.entries(allStarDates)
    .map(([date, stars]) => ({ date, stars }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return { overview, starsByDay }
}

export const useFetchRepoIntelligenceDatas = (username: string | null) => {
  const { getToken, loading } = useAuthStore()

  return useQuery({
    queryKey: ['fetch_repo_intelligence_datas', username],
    enabled: !loading && !!username,
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error("No auth token available")
      return fetchRepoIntelligenceDatas(username!, token)
    }
  })
}

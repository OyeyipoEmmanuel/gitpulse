import { fetchGraphQL } from "@/lib/github"
import { useAuthStore } from "@/store/authStore"
import { useQuery } from "@tanstack/react-query"
import type { RepositoryNode, StargazerEdge } from "@/types"

const OVERVIEW_QUERY = `
query($username: String!, $since: GitTimestamp!) {
  user(login: $username) {
    repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      nodes {
        name
        pushedAt
        isArchived
        diskUsage
        stargazerCount
        forkCount
        primaryLanguage { name }
        openIssues: issues(states: OPEN) { totalCount }
        openPRs: pullRequests(states: OPEN) { totalCount }
        pullRequests { totalCount }
        licenseInfo { name }
        updatedAt
        languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name color } }
        }
        licenseInfo { name }
        object(expression: "HEAD:README.md") { 
          ... on Blob { text }
        }
        defaultBranchRef {
          target {
            ... on Commit {
              committedDate
              history(since: $since) { totalCount }
            }
          }
        }
      }
    }
  }
}
`

const STAR_GROWTH_QUERY = `
query($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    stargazers(last: 100, orderBy: {field: STARRED_AT, direction: ASC}) {
      edges {
        starredAt
      }
    }
  }
}
`

export const fetchRepoIntelligenceDatas = async (username: string, token: string) => {
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const overview = await fetchGraphQL(OVERVIEW_QUERY, { username, since: since.toISOString() }, token)

  const repos = overview?.user?.repositories?.nodes?.map((n: RepositoryNode) => n.name)

  const starResults = await Promise.all(
    repos.map((repo: string) =>
      fetchGraphQL(STAR_GROWTH_QUERY, { owner: username, repo }, token)
    )
  )

  const allStarDates = starResults
    .flatMap(r => r?.repository?.stargazers?.edges?.map((e: StargazerEdge) => e.starredAt))
    .filter((date: string | undefined) => date != undefined)
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
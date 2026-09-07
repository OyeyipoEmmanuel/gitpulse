import { fetchGraphQL, fetchGraphQLConnection, type GraphQLConnection } from "@/lib/github"
import { GitHubDataError } from "@/lib/githubErrors"
import { useAuthStore } from "@/store/authStore"
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query"
import { fetchRepoIntelligenceDatas } from "./fetchRepoIntelligenceData"
import { fetchProductivityDatas } from "./fetchProductivityDatas"
import type { CodeQualityNode, OpenSourceNode } from "@/types"

//Get this time last year date
// const today = new Date()
// const thisYearStart = `${today.getFullYear()}-01-01T00:00:00Z`
// const thisYearEnd = today.toISOString()
// const lastYearStart = `${today.getFullYear() - 1}-01-01T00:00:00Z`
// const lastYearEnd = new Date(
//   today.getFullYear() - 1,
//   today.getMonth(),
//   today.getDate()
// ).toISOString()

// const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())


const CODE_QUALITY_QUERY = `
query($username: String!, $cursor: String) {
  user(login: $username) {
    pullRequests(first: 100, states: [MERGED, CLOSED], after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        additions
        deletions
        state
        repository { name }
      }
    }
  }
}`

const COLLABORATION_QUERY = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      pullRequestReviewContributions {
        totalCount
      }
    }
  }
}`

const OPEN_SOURCE_QUERY = `
query($username: String!, $cursor: String) {
  user(login: $username) {
    pullRequests(first: 100, states: MERGED, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        repository {
          name
          nameWithOwner
          owner { login }
          stargazerCount
        }
        mergedAt
      }
    }
  }
}`

export const reportCardDatasFetch = async (username: string | null, token: string, queryClient: QueryClient) => {

  const [repoData, productivityData] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: ['fetch_repo_intelligence_datas', username],
      queryFn: () => fetchRepoIntelligenceDatas(username!, token),
    }),
    queryClient.fetchQuery({
      queryKey: ['fetch_productivity_datas', username],
      queryFn: () => fetchProductivityDatas(username!, token),
    }),
  ])


  type CodeData = { user: null | { pullRequests: GraphQLConnection<CodeQualityNode> } }
  type CollabData = { user: null | { contributionsCollection: { pullRequestReviewContributions: { totalCount: number } } } }
  type OpenSourceData = { user: null | { pullRequests: GraphQLConnection<OpenSourceNode> } }

  const [codeResult, collabResponse, openSourceResult] = await Promise.all([
    fetchGraphQLConnection<CodeData, CodeQualityNode>(CODE_QUALITY_QUERY, { username }, token, data => data.user?.pullRequests),
    fetchGraphQL<CollabData>(COLLABORATION_QUERY, { username }, token),
    fetchGraphQLConnection<OpenSourceData, OpenSourceNode>(OPEN_SOURCE_QUERY, { username }, token, data => data.user?.pullRequests),
  ])

  const firstCodeUser = codeResult.firstPage.user
  const firstOpenSourceUser = openSourceResult.firstPage.user
  if (!firstCodeUser || !collabResponse.user || !firstOpenSourceUser) {
    throw new GitHubDataError("The requested GitHub user could not be found.")
  }
  const codeQuality = {
    user: { ...firstCodeUser, pullRequests: { ...firstCodeUser.pullRequests, nodes: codeResult.nodes } },
  }
  const openSource = {
    user: { ...firstOpenSourceUser, pullRequests: { ...firstOpenSourceUser.pullRequests, nodes: openSourceResult.nodes } },
  }
  const collab = { user: collabResponse.user }

  return { repoData, productivityData, codeQuality, collab, openSource }
}

export const useFetchReportCardDatas = (username: string | null) => {
  const { getToken, loading } = useAuthStore()

  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['fetch_report_card_datas', username],
    enabled: !loading && !!username,

    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error("No auth token available")

      return reportCardDatasFetch(username, token, queryClient)
    }
  })
}

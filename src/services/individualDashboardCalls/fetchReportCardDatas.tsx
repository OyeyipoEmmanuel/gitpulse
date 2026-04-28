import { fetchGraphQL } from "@/lib/github"
import { useAuthStore } from "@/store/authStore"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchRepoIntelligenceDatas } from "./fetchRepoIntelligenceData"
import { fetchProductivityDatas } from "./fetchProductivityDatas"

//Get this time last year date
const today = new Date()
// const thisYearStart = `${today.getFullYear()}-01-01T00:00:00Z`
// const thisYearEnd = today.toISOString()
// const lastYearStart = `${today.getFullYear() - 1}-01-01T00:00:00Z`
// const lastYearEnd = new Date(
//   today.getFullYear() - 1,
//   today.getMonth(),
//   today.getDate()
// ).toISOString()

const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())


const CODE_QUALITY_QUERY = `
query($username: String!) {
  user(login: $username) {
    pullRequests(first: 100, states: [MERGED, CLOSED]) {
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
query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      pullRequestReviewContributions(first: 100) {
        totalCount
        nodes {
          pullRequest {
            createdAt
            comments { totalCount }
            reviews { totalCount }
          }
          occurredAt
        }
      }
    }
  }
}`

const OPEN_SOURCE_QUERY = `
query($username: String!) {
  user(login: $username) {
    pullRequests(first: 100, states: MERGED) {
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

export const useFetchReportCardDatas = (username: string | null) => {
    const { getToken, loading } = useAuthStore()
    const queryClient = useQueryClient()

    return useQuery({
        queryKey: ['fetch_report_card_datas', username],
        enabled: !loading && !!username,
        queryFn: async () => {
            const token = await getToken()
            if (!token) throw new Error("No auth token available")

            const [repoData, productivityData] = await Promise.all([
                queryClient.fetchQuery({
                    queryKey: ['fetch_repo_intelligence_datas', username],
                    queryFn: () => fetchRepoIntelligenceDatas(username!, token),
                    staleTime: Infinity,
                }),
                queryClient.fetchQuery({
                    queryKey: ['fetch_productivity_datas', username],
                    queryFn: () => fetchProductivityDatas(username!, token),
                    staleTime: Infinity,
                }),
            ])


            const [codeQuality, collab, openSource] = await Promise.all([
                fetchGraphQL(CODE_QUALITY_QUERY, { username }, token),
                fetchGraphQL(COLLABORATION_QUERY, { username, from: oneYearAgo.toISOString(), to: today.toISOString() }, token),
                fetchGraphQL(OPEN_SOURCE_QUERY, { username }, token),

            ])

            return {repoData, productivityData, codeQuality, collab, openSource}
        }
    })
}

import { fetchGraphQLConnection, type GraphQLConnection } from "@/lib/github"
import { githubJson } from "@/lib/githubFetch"
import { GitHubDataError } from "@/lib/githubErrors"
import type { GithubEvent, PinnedRepo, StarredRepo } from "@/types"
import { useAuthStore } from "@/store/authStore"
import { useQuery } from "@tanstack/react-query"

const PROFILE_OVERVIEW_QUERY = `
  query($username: String!, $cursor: String) {
    user(login: $username) {
      name
      login
      bio
      avatarUrl
      location
      company
      pronouns
      createdAt
      followers { totalCount }
      following { totalCount }

      pinnedItems(first: 4, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            isPrivate
            stargazerCount
            forkCount
            primaryLanguage { name color }
          }
        }
      }

      repositories(first: 100, ownerAffiliations: OWNER, after: $cursor) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          primaryLanguage { name color }
          openPRs: pullRequests(states: OPEN) { totalCount }
          mergedPRs: pullRequests(states: MERGED) { totalCount }
          closedPRs: pullRequests(states: CLOSED) { totalCount }
        }
      }
    }
  }
`

interface ProfileRepository {
  primaryLanguage: { name: string; color: string } | null
  openPRs: { totalCount: number }
  mergedPRs: { totalCount: number }
  closedPRs: { totalCount: number }
}

interface ProfileUser {
  name: string | null
  login: string
  bio: string | null
  avatarUrl: string
  location: string | null
  company: string | null
  pronouns: string | null
  createdAt: string
  followers: { totalCount: number }
  following: { totalCount: number }
  pinnedItems: { nodes: PinnedRepo[] }
  repositories: GraphQLConnection<ProfileRepository> & { totalCount: number }
}

export const fetchProfilePageDatas = async (username: string | null, token: string) => {

  const url = import.meta.env.VITE_GITHUB_API_URL

  type ProfileData = { user: ProfileUser | null }
  const [profileResult, starredRepos, recentEvents] = await Promise.all([
    fetchGraphQLConnection<ProfileData, ProfileRepository>(
      PROFILE_OVERVIEW_QUERY,
      { username },
      token,
      data => data.user?.repositories,
    ),

    //starred repos
    githubJson<StarredRepo[]>(`${url}/users/${username}/starred?per_page=4`, token),

    //recent events
    githubJson<GithubEvent[]>(`${url}/users/${username}/events?per_page=4`, token),
  ])

  const firstUser = profileResult.firstPage.user
  if (!firstUser) throw new GitHubDataError("The requested GitHub user could not be found.")
  const graphqlData = {
    ...profileResult.firstPage,
    user: {
      ...firstUser,
      repositories: { ...firstUser.repositories, nodes: profileResult.nodes },
    },
  }
  return { graphqlData, starredRepos, recentEvents }
}

export const useFetchProfilePageDatas = (username: string | null) => {

  const { getToken, loading } = useAuthStore()

  return useQuery({
    queryKey: ['fetch_profilepage_datas', username],
    enabled: !loading && !!username,
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error("No auth token available")

      return fetchProfilePageDatas(username, token)

    }
  })

}

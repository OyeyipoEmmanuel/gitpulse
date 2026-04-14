import { fetchGraphQL } from "@/lib/github"
import { useAuthStore } from "@/store/authStore"
import { useQuery } from "@tanstack/react-query"


const PROFILE_OVERVIEW_QUERY = `
  query($username: String!) {
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

      repositories(first: 100, ownerAffiliations: OWNER) {
        totalCount
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

export const useFetchProfilePageDatas = (username: string | null) => {

    const { getToken, loading } = useAuthStore()


    const url = import.meta.env.VITE_GITHUB_API_URL

    return useQuery({
        queryKey: ['fetch_profilepage_datas', username],
        enabled: !loading && !!username,
        queryFn: async () => {
            const token = await getToken()

            if (!token) throw new Error("No auth token available")

            const [graphqlData, starredRepos, recentEvents] = await Promise.all([
                //graphqlfetch
                fetchGraphQL(PROFILE_OVERVIEW_QUERY, { username }, token),

                //starred repos
                fetch(`${url}/users/${username}/starred?per_page=4`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then((res) => res.json()),

                //recent events
                fetch(`${url}/users/${username}/events?per_page=4`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then((res) => res.json()),
            ])

            return { graphqlData, starredRepos, recentEvents }
        }
    })

}

import { useAuthStore } from "@/store/authStore"
import { useQuery } from "@tanstack/react-query"

const GRAPHQL_DATAS = `
query($org: String!) {
    organization(login: $org) {
        name
        login
        description
        websiteUrl
        location
        avatarUrl
        membersWithRole { totalCount }

        repositories(first: 100) {
            totalCount
            nodes {
                stargazerCount
                forkCount
                primaryLanguage { name color }

        issues(states: OPEN) { totalCount }
        pullRequests(states: OPEN) { totalCount }
        defaultBranchRef {
            target {
                ... on Commit { history { totalCount } }
            }
        }
        }
        }
    }
}
`


export const useFetchOrgProfilePageData = (orgname: string) => {
    const { getToken, loading } = useAuthStore()


    const url = import.meta.env.VITE_GITHUB_API_URL

    return useQuery({
        queryKey: ['fetch_org_profilepage_datas', orgname],
        enabled: !loading && !!orgname,
        queryFn: async () => {
            const token = await getToken()

            if (!token) throw new Error("No auth token available")

            const [orgProfile] = await Promise.all([
                //profile fetch
                fetch(`${url}/orgs/${orgname}`, {
                    headers: {Authorization: `Bearer ${token}`}
                })
            ])

            return {orgProfile}

        }
    })
}
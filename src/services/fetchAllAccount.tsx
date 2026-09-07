//To fetch personal account and organization

import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../store/authStore"
import { githubAllPages, githubJson } from "../lib/githubFetch"
import { GitHubReconnectError } from "../lib/authErrors"
import type { GithubOrg } from "../types"

interface GithubAccount {
    login: string
    name: string | null
    bio: string | null
    avatar_url: string
}

export const useGetAccountsToDisplay = () => {
    const { loading, user, getToken } = useAuthStore();
    const url = import.meta.env.VITE_GITHUB_API_URL

    return useQuery({
        queryKey: ['fetch_all_accounts', user?.id],
        enabled: !loading && !!user,
        queryFn: async () => {
            const token = await getToken()
            if (!token) throw new GitHubReconnectError()

            const [account, orgs] = await Promise.all([
                githubJson<GithubAccount>(`${url}/user`, token),
                githubAllPages<GithubOrg>(`${url}/user/orgs?per_page=100`, token),
            ])
            return { user: account, orgs }
        }
    })

}

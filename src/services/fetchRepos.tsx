import { useAuthStore } from "@/store/authStore"
import { useQuery } from "@tanstack/react-query"
import { githubAllPages } from "@/lib/githubFetch"
import type { GithubRepo } from "@/types"

export const useFetchIndividualRepos = (username: string, type: string) => {
    const { getToken, loading } = useAuthStore()

    const url = import.meta.env.VITE_GITHUB_API_URL

    return useQuery({
        queryKey: ['fetch_individual_repo', username, type],
        enabled: !loading && !!username,
        queryFn: async () => {
            const token = await getToken()

            if (!token) throw new Error("No auth token available")

            return githubAllPages<GithubRepo>(
                `${url}/${type}/${username}/repos?sort=updated&per_page=100`,
                token,
            )
        }
    })
}

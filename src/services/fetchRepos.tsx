import { useAuthStore } from "@/store/authStore"
import { useQuery } from "@tanstack/react-query"

export const useFetchIndividualRepos = (username: string) => {
    const { providerToken, loading } = useAuthStore()

    const url = import.meta.env.VITE_GITHUB_API_URL

    const headers = { Authorization: `Bearer ${providerToken}` }

    return useQuery({
        queryKey: ['fetch_individual_repo', username],
        enabled: !loading && !!providerToken && !!username,
        queryFn: async () => {
            const res = await fetch(`${url}/users/${username}/repos?sort=updated&per_page=10`, { headers })

            if (!res.ok) throw new Error(res.statusText)


            const data = await res.json()

            return data
        }
    })

}
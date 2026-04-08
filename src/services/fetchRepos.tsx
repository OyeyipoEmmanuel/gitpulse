import { useAuthStore } from "@/store/authStore"
import { useQuery } from "@tanstack/react-query"

export const useFetchIndividualRepos = (username: string, type: string) => {
    const { getToken, loading } = useAuthStore()

    const url = import.meta.env.VITE_GITHUB_API_URL

    return useQuery({
        queryKey: ['fetch_individual_repo', username, type],
        enabled: !loading && !!username,
        queryFn: async () => {
            const token = await getToken()

            if (!token) throw new Error("No auth token available")

            const res = await fetch(
                `${url}/${type}/${username}/repos?sort=updated&per_page=10`,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (!res.ok) throw new Error(res.statusText)

            return res.json()
        }
    })
}
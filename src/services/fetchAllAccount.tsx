//To fetch personal account and organization

import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../store/authStore"

export const useGetAccountsToDisplay = () => {
    const { session, loading } = useAuthStore();
    const url = import.meta.env.VITE_GITHUB_API_URL

    const token = session?.provider_token
    console.log(session)

    const headers = { Authorization: `Bearer ${token}` }

    return useQuery({
        queryKey: ['fetch_all_accounts'],
        enabled: !loading && !!token,
        retry: 2,
        staleTime: 1000 * 60 * 5, // 5 mins
        gcTime: 1000 * 60 * 10,
        queryFn: async () => {
            const [userRes, orgRes] = await Promise.all([
                fetch(`${url}/user`, { headers }),
                fetch(`${url}/user/orgs`, { headers }),
            ])

            if (!userRes.ok) throw new Error(userRes.statusText)
            if (!orgRes.ok) throw new Error(orgRes.statusText)


            const user = await userRes.json()
            const orgs = await orgRes.json()

            return { user, orgs }
        }
    })

}
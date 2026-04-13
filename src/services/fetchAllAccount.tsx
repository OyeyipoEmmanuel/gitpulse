//To fetch personal account and organization

import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../store/authStore"

export const useGetAccountsToDisplay = () => {
    const { loading, providerToken, getToken } = useAuthStore();
    const url = import.meta.env.VITE_GITHUB_API_URL

    return useQuery({
        queryKey: ['fetch_all_accounts'],
        enabled: !loading && !!providerToken,
        retry: 2,
        staleTime: 1000 * 60 * 5, // 5 mins
        gcTime: 1000 * 60 * 10,
        queryFn: async () => {
            const token = await getToken()

            const [userRes, orgRes] = await Promise.all([
                fetch(`${url}/user`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                ),
                fetch(`${url}/user/orgs`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                ),
            ])

            if (!userRes.ok) throw new Error(userRes.statusText)
            if (!orgRes.ok) throw new Error(orgRes.statusText)


            const user = await userRes.json()
            const orgs = await orgRes.json()

            return { user, orgs }
        }
    })

}
//To fetch personal account and organization

import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../../store/authStore"

export const useGetAccountsToDisplay = ()=>{
    const {session, loading} = useAuthStore();

    const token = session?.provider_token

    const headers = {Authorization: `Bearer ${token}`}

    return useQuery({
        queryKey: ['fetch_all_accounts'],
        enabled: !loading && !!token,
        queryFn: async()=>{
            const [userRes, orgRes] = await Promise.all([
                fetch("https://api.github.com/user", {headers}),
                fetch("https://api.github.com/user/orgs", {headers}),
            ])

            const user = await userRes.json()
            const orgs = await orgRes.json()

            return {user, orgs}
        }
    })

}
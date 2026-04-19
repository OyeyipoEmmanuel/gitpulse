import { useAuthStore } from "@/store/authStore"
import { useQuery } from "@tanstack/react-query"




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
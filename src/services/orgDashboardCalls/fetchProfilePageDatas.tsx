import { useAuthStore } from "@/store/authStore"
import { useQuery } from "@tanstack/react-query"
import { githubFetch } from "@/lib/githubFetch"




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
                githubFetch(`${url}/orgs/${orgname}`, token, {
                    headers: {Authorization: `Bearer ${token}`}
                })
            ])

            return {orgProfile}

        }
    })
}

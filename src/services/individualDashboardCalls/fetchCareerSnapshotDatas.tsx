import { useAuthStore } from "@/store/authStore"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchProfilePageDatas } from "./fetchProfilePageDatas"
import { reportCardDatasFetch } from "./fetchReportCardDatas"

export const useFetchCareerSnapshot = (username: string | null) => {
    const { getToken, loading } = useAuthStore()
    const queryClient = useQueryClient()


    return useQuery({
        queryKey: ['fetch_career_snapshot_datas', username],
        enabled: !loading && !!username,
        queryFn: async () => {
            const token = await getToken()
            if (!token) throw new Error("No auth token available")

            const [profileData, reportCard] = await Promise.all([
                queryClient.fetchQuery({
                    queryKey: ['fetch_profilepage_datas', username],
                    queryFn: () => fetchProfilePageDatas(username!, token),
                    staleTime: Infinity,
                }),
                queryClient.fetchQuery({
                    queryKey: ['fetch_report_card_datas', username],
                    queryFn: () => reportCardDatasFetch(username!, token, queryClient),
                    staleTime: Infinity,
                }),
            ])


            

            return {userGithubAge: profileData?.graphqlData?.user?.createdAt, reportCard}
        }
    })
}
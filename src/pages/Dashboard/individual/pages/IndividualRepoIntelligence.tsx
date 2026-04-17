import { useFetchRepoIntelligenceDatas } from "@/services/individualDashboardCalls/fetchRepoIntelligenceData"
import { useParams } from "react-router-dom"


const IndividualRepoIntelligence = () => {
    const params = useParams()

    const {data, isPending, error} = useFetchRepoIntelligenceDatas(params.username ?? null)

    !isPending && console.log(error)
    !isPending && !error && console.log(data)
  return (
    <main>

    </main>
  )
}

export default IndividualRepoIntelligence
import { LoadingSpinner } from "@/components/ui/spinner"
import ErrorToast from "@/components/ui/error-toast"
import { useFetchRepoIntelligenceDatas } from "@/services/individualDashboardCalls/fetchRepoIntelligenceData"
import type { RepositoryNode } from "@/types"
import { useParams } from "react-router-dom"
import Card from "../components/Card"
import BarsForMostActiveRepos from "../components/BarsForMostActiveRepos"
import DeadReposCard from "../components/DeadReposCard"
import StarsGrowthAreaChart from "@/components/charts/StarsGrowthAreaChart"



function getMostUsedLang(arrOfLanguages: string[]) {
  const map = new Map()

  for (let i = 0; i < arrOfLanguages.length; i++) {
    if (!arrOfLanguages[i]) continue

    if (map.has(arrOfLanguages[i])) {
      map.set(arrOfLanguages[i], map.get(arrOfLanguages[i]) + 1)
      continue;
    }
    map.set(arrOfLanguages[i], 1)
  }

  let max: number = 0
  let mostUsed: string = ""
  map.forEach((v, k) => {
    if (v > max) {
      max = v
      mostUsed = k
    }
  })

  return mostUsed
}

const IndividualRepoIntelligence = () => {
  const params = useParams()

  const { data, isPending, error } = useFetchRepoIntelligenceDatas(params.username ?? null)

  if (error) return <ErrorToast message={error.message} />
  if (isPending) return (<LoadingSpinner className="text-green-500 w-32 h-32" />)

  const overview = data?.overview?.user?.repositories

  //get total repo count
  const totalRepoCount = overview?.totalCount

  //get totalStars
  const totalStars = overview?.nodes?.reduce((acc: number, r: RepositoryNode) =>
    acc + (r.stargazerCount ?? 0), 0
  )

  //get totalForks
  const totalFork = overview?.nodes?.reduce((acc: number, r: RepositoryNode) =>
    acc + (r.forkCount ?? 0), 0
  )

  console.log(data)

  // get most used Language
  const arr: string[] = []
  overview?.nodes?.map((node: RepositoryNode) => {

    if (node?.primaryLanguage?.name) {
      arr.push(node.primaryLanguage.name)
    }


  })
  const mostUsedLang = getMostUsedLang(arr)

  //get most active repos

  //Get 30days before now
  const date = new Date()
  date.setDate(date.getDate() - 30)
  const thirtyDaysAgo = date.toISOString()
  console.log(thirtyDaysAgo)

  //filter array with last 30days updated fiel
  const activeRepos = overview?.nodes
    ?.filter((node: RepositoryNode) => thirtyDaysAgo <= node.updatedAt)
    ?.map((node: RepositoryNode) => ({ name: node.name, totalCount: node.defaultBranchRef?.target?.history?.totalCount }))


  // Get Dead repos
  //Get 6months(30*6=180) before now
  date.setDate(date.getDate() - 180)
  const sixMonthBefore = date.toISOString()

  const deadRepos = overview?.nodes
    ?.filter((node: RepositoryNode) => sixMonthBefore >= node.updatedAt)
    ?.map((node: RepositoryNode) => ({ name: node.name, updatedAt: node.updatedAt, diskUsage: node.diskUsage ?? 0 }))


  return (
    <main className="py-4 px-4 md:px-0 flex flex-col gap-6">
      {/* Stats */}
      <Card className="flex flex-col md:flex-row items-center justify-between w-full">
        <div className="flex w-full p-5 flex-col border-b md:border-b-0 md:border-r border-[#2A2F36] space-y-2">
          <p className="text-graySubtextColor font-semibold tracking-tighter text-sm uppercase">Total Repos</p>
          <p className="text-4xl text-white numbersFont font-extrabold">{totalRepoCount}</p>
        </div>

        <div className="flex w-full p-5 flex-col border-b md:border-b-0 md:border-r border-[#2A2F36] space-y-2">
          <p className="text-graySubtextColor font-semibold tracking-tighter text-sm uppercase">Total stars</p>
          <p className="text-4xl text-white numbersFont font-extrabold">{totalStars}</p>
        </div>

        <div className="flex w-full p-5 flex-col border-b md:border-b-0 md:border-r border-[#2A2F36] space-y-2">
          <p className="text-graySubtextColor font-semibold tracking-tighter text-sm uppercase">Total forks</p>
          <p className="text-4xl text-white numbersFont font-extrabold">{totalFork}</p>
        </div>

        <div className="flex w-full p-5 flex-col border-b md:border-b-0 md:border-r border-[#2A2F36] space-y-2">
          <p className="text-graySubtextColor font-semibold tracking-tighter text-sm uppercase">most used language</p>
          <p className="text-3xl text-white font-semibold">{mostUsedLang}</p>
        </div>

      </Card>

      <section className="flex flex-col md:flex-row gap-5">
        {/* Most Active repos */}
        <Card className="w-full md:w-[60%] p-5" >
          <div>
            <h1 className="text-white font-semibold text-lg">Most Active Repos</h1>
            <p className="text-graySubtextColor text-xs pt-1">Commits in last 30days</p>
          </div>

          <BarsForMostActiveRepos recentRepos={activeRepos} />
        </Card>

        {/* Dead repos */}
        <DeadReposCard deadRepos={deadRepos} />
      </section>

      <section>
        {/* Stars Growth */}
         <Card className="w-full p-5" >
          <div>
            <h1 className="text-white font-semibold text-lg">Star Velocity</h1>
            <p className="text-graySubtextColor text-xs pt-1">How fast your repos are being discovered</p>
          </div>

          <StarsGrowthAreaChart data={data?.starsByDay}/>
        </Card>
        <div></div>
      </section>

      <section>

      </section>

    </main>
  )
}

export default IndividualRepoIntelligence
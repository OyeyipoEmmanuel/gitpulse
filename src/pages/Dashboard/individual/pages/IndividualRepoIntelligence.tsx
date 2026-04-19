import { LoadingSpinner } from "@/components/ui/spinner"
import ErrorToast from "@/components/ui/error-toast"
import { useFetchRepoIntelligenceDatas } from "@/services/individualDashboardCalls/fetchRepoIntelligenceData"
import { useParams } from "react-router-dom"
import Card from "../components/Card"



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
  const totalStars = overview?.nodes?.reduce((acc: any, r: any) =>
    acc + (r.stargazerCount ?? 0), 0
  )

  //get totalForks
  const totalFork = overview?.nodes?.reduce((acc: any, r: any) =>
    acc + (r.forkCount ?? 0), 0
  )

  console.log(overview?.nodes[0]?.primaryLanguage.name)

  // get most used Language
  const arr: string[] = []
  overview?.nodes?.map((node: any) => {

    if (node?.primaryLanguage?.name) {
      arr.push(node.primaryLanguage.name)
    }
  })

  const mostUsedLang = getMostUsedLang(arr)

  return (
    <main className="py-4 px-4 md:px-0">
      <Card className="flex flex-col md:flex-row items-center justify-between w-full">
        <div className="flex w-full p-5 flex-col border-b md:border-r border-[#2A2F36] space-y-2">
          <p className="text-graySubtextColor font-semibold tracking-tighter text-sm uppercase">Total Repos</p>
          <p className="text-4xl text-white numbersFont font-extrabold">{totalRepoCount}</p>
        </div>

        <div className="flex w-full p-5 flex-col border-b md:border-r border-[#2A2F36] space-y-2">
          <p className="text-graySubtextColor font-semibold tracking-tighter text-sm uppercase">Total stars</p>
          <p className="text-4xl text-white numbersFont font-extrabold">{totalStars}</p>
        </div>

        <div className="flex w-full p-5 flex-col border-b md:border-r border-[#2A2F36] space-y-2">
          <p className="text-graySubtextColor font-semibold tracking-tighter text-sm uppercase">Total forks</p>
          <p className="text-4xl text-white numbersFont font-extrabold">{totalFork}</p>
        </div>

        <div className="flex w-full p-5 flex-col border-b md:border-r border-[#2A2F36] space-y-2">
          <p className="text-graySubtextColor font-semibold tracking-tighter text-sm uppercase">most used language</p>
          <p className="text-3xl text-white font-semibold">{mostUsedLang}</p>
        </div>

      </Card>


      <section>
        {/* Most Active repos */}
        <div></div>

        {/* Dead repos */}
        <div></div>
      </section>

      <section>
        <div></div>
        <div></div>
      </section>

      <section>

      </section>

    </main>
  )
}

export default IndividualRepoIntelligence
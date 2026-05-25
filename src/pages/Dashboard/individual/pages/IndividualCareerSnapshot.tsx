import ErrorToast from "@/components/ui/error-toast"
import { LoadingSpinner } from "@/components/ui/spinner"
import { fetchGraphQL } from "@/lib/github"
import { useFetchCareerSnapshot } from "@/services/individualDashboardCalls/fetchCareerSnapshotDatas"
import { useAuthStore } from "@/store/authStore"
import type { RepositoryNode, TotalContributionObjectType } from "@/types"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { openSourceFunc } from "./IndividualReportCard"
import Card from "../components/Card"
import { getTimeAgo } from "@/lib/timeAgo"
import { GrLineChart } from "react-icons/gr";
import { IoStarSharp } from "react-icons/io5";
import { MdOutlineFileDownload } from "react-icons/md";




async function getAllTimeContributionCount(
    dateCreated: string,
    username: string,
    getToken: () => Promise<string | null>
) {
    const joinYear = new Date(dateCreated).getFullYear()
    const currentYear = new Date().getFullYear()

    const token = await getToken()

    if (!token) {
        throw new Error("No auth token available")
    }

    const currentDate = new Date().toISOString()

    const yearQueries = Array.from(
        { length: currentYear - joinYear + 1 },
        (_, i) => joinYear + i
    )
        .map((year) => {
            const from = `${year}-01-01T00:00:00Z`

            const to =
                year === currentYear
                    ? currentDate
                    : `${year}-12-31T23:59:59Z`

            return `
        y${year}: contributionsCollection(
          from: "${from}"
          to: "${to}"
        ) {
          contributionCalendar {
            totalContributions
          }
        }
      `
        })
        .join("\n")

    const ALL_TIME_QUERY = `
    query($username: String!) {
      user(login: $username) {
        ${yearQueries}
      }
    }
  `

    const data = await fetchGraphQL(
        ALL_TIME_QUERY,
        { username },
        token
    )

    console.log(data)

    return data
}

function getLanguageMastered(repoNodes: RepositoryNode[]) {

    const map = new Map<string, { count: number; color: string }>()
    const res: { name: string; color: string }[] = []

    for (let i = 0; i < repoNodes.length; i++) {
        const lang = repoNodes[i]?.primaryLanguage
        if (!lang) continue  // skip repos with no language

        if (map.has(lang.name)) {
            map.set(lang.name, { count: map.get(lang.name)!.count + 1, color: lang.color || "red" })
            continue;
        }

        map.set(lang.name, { count: 1, color: lang.color ?? "red" })
    }

    map.forEach((v, k) => {
        if (v.count >= 3) {
            res.push({ name: k, color: v.color })
        }
    })

    return res
}

const IndividualCareerSnapshot = () => {
    const [totalContributionObject, setTotalContributionObject] = useState<TotalContributionObjectType | null>(null)

    const params = useParams()
    const { getToken, loading } = useAuthStore()


    const { data, isPending, error } = useFetchCareerSnapshot(params.username ?? "")

    useEffect(() => {
        async function loadContributions() {
            try {
                const datas = await getAllTimeContributionCount(
                    data?.userGithubAge,
                    params.username ?? "",
                    getToken
                )

                setTotalContributionObject(datas)
            } catch (err) {
                <ErrorToast message={"An error Occured"} />
            }
        }

        if (data?.userGithubAge && params.username) {
            loadContributions()
        }
    }, [data?.userGithubAge, params.username])

    if (error) return <ErrorToast message={error.message} />
    if (isPending || loading) return <LoadingSpinner className="text-green-500 w-32 h-32" />


    const githubAge = getTimeAgo(data?.userGithubAge)
    console.log(githubAge)

    const totalContributionCount = Object.values(totalContributionObject?.user || {}).reduce(
        (sum: number, yearData: any) =>
            sum + yearData.contributionCalendar.totalContributions,
        0
    )

    //Get busiest year
    const busiestYear = Object.entries(totalContributionObject ? totalContributionObject?.user : {}).reduce((max: { year: string; count: number }, [year, yearData]: [string, any]) =>
        yearData.contributionCalendar.totalContributions > max.count ? { year, count: yearData.contributionCalendar.totalContributions }
            : max
        , { year: "", count: 0 })

    const currentYear = new Date().getFullYear()
    const busiestYearNum = parseInt(busiestYear.year.replace("y", ""))

    const daysInBusiestYear = busiestYearNum === currentYear
        ? Math.floor((new Date().getTime() - new Date(`${currentYear}-01-01`).getTime()) / (1000 * 60 * 60 * 24))
        : 365

    //OS contribution count
    const OSContributionCount = openSourceFunc(data?.reportCard?.openSource?.user?.pullRequests?.nodes, params.username!).stats["PRs Merged"]

    const langMastered = getLanguageMastered(data?.reportCard?.repoData?.overview?.user?.repositories?.nodes)


    return (
        <main className="fullPageGradientBg min-h-screen">
            <section className="py-4 px-4 flex flex-col gap-6">
                <div className="flex flex-col justify-between md:flex-row">
                    <p className="text-graySubtextColor">A high-fidelity analysis of your engineering journey on Github.</p>
                    <button className="w-fit self-end tracking-tight bg-[#248637] rounded-xs text-center px-6 py-2 md:self-start text-white text-sm font-semibold cursor-pointer hover:opacity-70 transition-all duration-200 flex items-center gap-2">
                        <MdOutlineFileDownload />
                        <p>Download as PNG</p>
                    </button>
                </div>


                {/* Row 1 */}
                <section className="">
                    <Card className="w-full grid grid-cols-1 md:grid-cols-3 ">
                        <div className="p-5 md:border-b-none md:border-r border-b border-[#2A2F36] flex flex-col gap-3">
                            <p className="text-graySubtextColor uppercase text-[12px] font-bold tracking-wider">github age</p>
                            <span className="flex text-white numbersFont">
                                {/* Years */}
                                <p className="text-5xl font-extrabold">{githubAge.years > 0 && githubAge.years}</p>
                                <p className="self-end pl-1 text-graySubtextColor tracking-wider">{githubAge.years > 0 && "years, "}</p>

                                {/* Month */}
                                <p className="text-5xl font-extrabold">{githubAge.months > 0 && githubAge.months}</p>
                                <p className="self-end pl-1 text-graySubtextColor  tracking-wider">{githubAge.months > 0 && "months"}</p>
                            </span>
                        </div>
                        <div className="p-5 md:border-b-none md:border-r border-b border-[#2A2F36] flex flex-col gap-3">
                            <p className="text-graySubtextColor uppercase text-[12px] font-bold tracking-wider">all-time contributions</p>
                            <span className="flex gap-2">
                                <GrLineChart className="text-secondaryTextColor self-center" />
                                <p className="text-secondaryTextColor tracking-wider text-5xl numbersFont">{totalContributionCount ?? "..."}</p>
                            </span>
                        </div>
                        <div className="p-5 flex flex-col gap-3">
                            <p className="text-graySubtextColor uppercase text-[12px] font-bold tracking-wider">os contribution count</p>

                            <span className="flex gap-1">
                                <p className="text-5xl font-extrabold text-white">{OSContributionCount}</p>
                                <p className="self-end pl-1 text-graySubtextColor  tracking-wider">PRs Merged</p>
                            </span>

                        </div>
                    </Card>
                </section>

                {/* Row 2 */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Card className="p-5">
                        <p className="text-graySubtextColor uppercase text-sm font-semibold tracking-wider">Languages Mastered</p>
                        <p className="text-graySubtextColor text-xs pt-1 font-light">Languages used in 3 and more repos.</p>

                        <div className="grid grid-cols-2 gap-3 pt-12">
                            {langMastered.map((lang, idx) => (
                                <span key={idx} className="bg-[#21262D] border border-[#2A3037] rounded-full px-4 py-1 flex gap-3 items-center text-white ">
                                    <div style={{
                                        backgroundColor: lang.color
                                    }} className="w-2 h-2 rounded-full"></div>
                                    <p className={`text-sm font-light tracking-wider ${idx == 0 && "font-semibold"}`}>{lang.name}</p>
                                </span>
                            ))}
                        </div>
                    </Card>

                    <div className="bg-[#0F1D1B] border border-[#133120] rounded-lg p-5 flex flex-col justify-between gap-6">
                        <span className="flex justify-between">
                            <p className="text-secondaryTextColor uppercase text-[12px] font-bold tracking-widest">busiest year ever</p>
                            <IoStarSharp className="text-3xl text-[#238636]" />
                        </span>
                        <span>
                            <p className="text-white tracking-wider text-5xl numbersFont">{busiestYear.year.slice(1,)}</p>
                            <p className="text-secondaryTextColor text-2xl numbersFont">{busiestYear.count} contributions</p>
                        </span>
                        <p className="flex gap-1 text-graySubtextColor text-sm">
                            Averaging <p className="font-semibold">{(busiestYear.count / daysInBusiestYear).toFixed(1)} </p> activities per day during peak cycles.
                        </p>
                    </div>
                </section>

                {/* Row 3 */}
                <section>

                </section>
            </section>

        </main>
    )
}

export default IndividualCareerSnapshot
import ErrorToast from "@/components/ui/error-toast"
import { LoadingSpinner } from "@/components/ui/spinner"
import { gradeCalculator } from "@/lib/gradeCalculator"
import { useFetchReportCardDatas } from "@/services/individualDashboardCalls/fetchReportCardDatas"
import type { CodeQualityNode, ReportCardDimesions, RepositoryNode } from "@/types"
import { useParams } from "react-router-dom"
import Card from "../components/Card"
import { calculateConsistencyScore, getCurrentStreak } from "./IndividualProductivity"

function codeQualityFunc(data: CodeQualityNode[], repos: RepositoryNode[]): ReportCardDimesions {
    // Avg pr size
    const total = data?.reduce((acc: number, r: CodeQualityNode) =>
        acc + (r.additions + r.deletions), 0
    )
    const avgPrSize = (total / data.length).toFixed(0)

    //pr merge rate
    let totalMerged: number = 0
    data.map((eachPr) => {
        if (eachPr.state === "MERGED") {
            totalMerged += 1
        }
    })
    const prMergeRate = ((totalMerged / data.length) * 100)

    //Avg Prs per repo
    const totalPRs = repos.reduce((acc, repo) => acc + repo.pullRequests.totalCount, 0)
    const avgPRsPerRepo = Math.round(totalPRs / repos.length)

    //Get Grade
    const grade = gradeCalculator([prMergeRate])
    console.log(grade?.totalScore)

    return {
        label: "Code Quality",
        grade: grade?.grade,
        gradeColor: grade?.color,
        stats: {
            "Avg Pr Size": `${avgPrSize} lines`,
            "PR Merge Rate": `${prMergeRate.toFixed(0)}%`,
            "Avg PRs per repo": avgPRsPerRepo
        }
    }

}

function consistencyFunc(
    currStreak: number,
    consistencyScore: { score: number; remark: string; color: string },
    mostActiveWeek: { day: string; contributions: number }[]
): ReportCardDimesions {
    const mostActiveDay = mostActiveWeek.reduce((max, d) =>
        d.contributions > max.contributions ? d : max, mostActiveWeek[0]
    )

    const grade = gradeCalculator([consistencyScore.score])

    return {
        label: "Consistency",
        grade: grade?.grade,
        gradeColor: grade?.color,
        stats: {
            "Current Streak": `${currStreak} days`,
            "Consistency Score": `${consistencyScore.score}%`,
            "Most Active Day": mostActiveDay.day + "day",
        }
    }
}


const IndividualReportCard = () => {
    const params = useParams()
    let reportCardDimensions: ReportCardDimesions[] = []

    const { data, isPending, error } = useFetchReportCardDatas(params.username ?? null)

    if (error) return <ErrorToast message={error.message} />
    if (isPending) return (<LoadingSpinner className="text-green-500 w-32 h-32" />)

    console.log(data?.codeQuality)

    //code quality
    const codeQuality = codeQualityFunc(data?.codeQuality?.user?.pullRequests?.nodes, data?.repoData?.overview?.user?.repositories?.nodes)
    reportCardDimensions.push(codeQuality)

    // Consistency
    const productivityData = data?.productivityData
    const daysOfStreaks = productivityData?.getStreak?.user?.contributionsCollection?.contributionCalendar?.weeks?.flatMap((w: any) => w.contributionDays)

    const last12MonthsDays = productivityData?.consistencyData?.user?.contributionsCollection?.contributionCalendar?.weeks?.flatMap((w: any) => w.contributionDays)

    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayTotals: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 }
    last12MonthsDays.forEach((d: { contributionCount: number; date: string }) => {
        const dayIndex = new Date(d.date + 'T00:00:00').getDay()
        dayTotals[DAY_NAMES[dayIndex]] += d.contributionCount
    })
    const mostProductiveDaysData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
        day,
        contributions: dayTotals[day]
    }))

    const consistency = consistencyFunc(getCurrentStreak(daysOfStreaks), calculateConsistencyScore(last12MonthsDays), mostProductiveDaysData)
    reportCardDimensions.push(consistency)

    return (
        <main className="flex flex-col py-5 px-4 md:px-0">
            <p className="text-graySubtextColor ">How you measure up as a developer and collaborator</p>

            {/* Overall Score */}
            <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {reportCardDimensions.length > 0 && reportCardDimensions.map((report, idx) => (
                    <Card className="border-none flex flex-col" key={idx}>
                        <div className="bg-[#0D1117] flex flex-row items-center justify-between p-5 border border-[#20252C]">
                            <span className="gap-1 flex flex-col">
                                <p className="uppercase numbersFont text-xs font-semibold tracking-wider text-graySubtextColor">dimension 01</p>
                                <p className="capitalize text-white font-semibold text-xl">{report.label}</p>
                            </span>
                            <p className="font-extrabold text-3xl" style={{
                                color: report.gradeColor ?? "#1F6FEB"
                            }}>{report.grade}</p>
                        </div>
                        <div className="border border-[#20252C] flex flex-col gap-3">
                            {Object.entries(report.stats).map(([label, value]) => (
                                <div key={label} className="flex flex-row items-center justify-between px-5 py-3">
                                    <p className="text-graySubtextColor text-sm">{label}</p>
                                    <p className="text-white text-xl font-light numbersFont" style={{
                                        color: value.toString().includes('%') ? "#238636" : "white"
                                    }}>
                                        {String(value).split(' ')[0]}
                                        {String(value).includes(' ') && (
                                            <span className="text-sm text-graySubtextColor ml-1">{String(value).split(' ').slice(1).join(' ')}</span>
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </section>

            {/* Each category score */}
            <section></section>

            {/* How to improve */}
            <section></section>
        </main>
    )
}

export default IndividualReportCard
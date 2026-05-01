import ErrorToast from "@/components/ui/error-toast"
import { LoadingSpinner } from "@/components/ui/spinner"
import { gradeCalculator } from "@/lib/gradeCalculator"
import { useFetchReportCardDatas } from "@/services/individualDashboardCalls/fetchReportCardDatas"
import type { CodeQualityNode, CollaborationQuery, OpenSourceNode, ReportCardDimesions, RepositoryNode } from "@/types"
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
        gradeScore: grade?.totalScore ?? 0,
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
        gradeScore: grade?.totalScore ?? 0,
        stats: {
            "Current Streak": `${currStreak} days`,
            "Consistency Score": `${consistencyScore.score}%`,
            "Most Active Day": mostActiveDay.day + "day",
        }
    }
}

function collaborationFunc(collabData: CollaborationQuery, openSourceData: OpenSourceNode[], username: string): ReportCardDimesions {
    const prsReviewed = collabData?.totalCount
    const prsReviewedPercentageScore = Math.min((prsReviewed / 10) * 100, 100)

    const extRepos = openSourceData.filter(node => node.repository.owner.login !== username)

    const extRepoContributedTo = new Set(extRepos.map(node => node.repository.nameWithOwner)).size


    const totalPrsOpenedInOthersRepo = extRepos.length

    const totalPrsOpenedInOthersRepoPercentageScore = Math.min((totalPrsOpenedInOthersRepo / 5) * 100, 100)

    const grade = gradeCalculator([prsReviewedPercentageScore, totalPrsOpenedInOthersRepoPercentageScore])

    return {
        label: "Collaboration",
        grade: grade?.grade,
        gradeColor: grade?.color,
        gradeScore: grade?.totalScore ?? 0,
        stats: {
            "PRs Reviewed": prsReviewed,
            "External Repos": extRepoContributedTo,
            "PRs in Others Repos": totalPrsOpenedInOthersRepo,
        }
    }
}

function openSourceFunc(data: OpenSourceNode[], username: string): ReportCardDimesions {
    const extRepos = data.filter(node => node.repository.owner.login !== username)

    const extRepoContributedTo = new Set(extRepos.map(node => node.repository.nameWithOwner)).size

    const topRepo = extRepos.reduce((max, node) =>
        node.repository.stargazerCount > (max?.repository.stargazerCount ?? 0) ? node : max
        , extRepos[0])

    const grade = gradeCalculator([Math.min((extRepos.length / 5) * 100, 100)])

    return {
        label: "Open Source",
        grade: grade?.grade,
        gradeColor: grade?.color,
        gradeScore: grade?.totalScore ?? 0,
        stats: {
            "External Repos": extRepoContributedTo,
            "PRs Merged": extRepos.length,
            "Top Repo": topRepo?.repository.name ?? "—",
        }
    }
}

function maintenanceFunc(data: RepositoryNode[]): ReportCardDimesions {
    const totalCount = data?.filter((r: RepositoryNode) => r.isFork !== null).length
    const totalLicense = data?.filter((r: RepositoryNode) => r.licenseInfo !== null).length

    const totalReadme = data?.filter((r: RepositoryNode) => r.object !== null).length

    const totalLicensePercentage = Math.floor((totalLicense / totalCount) * 100)

    const totalReadmePercentage = Math.floor((totalReadme / totalCount) * 100)
    const grade = gradeCalculator([totalLicensePercentage, totalReadmePercentage])

    return {
        label: "Maintenance",
        grade: grade?.grade,
        gradeColor: grade?.color,
        gradeScore: grade?.totalScore ?? 0,
        stats: {},
        bars: [
            { label: "README Coverage", value: totalReadme, total: totalCount },
            { label: "License Coverage", value: totalLicense, total: totalCount },
        ]
    }
}


const IndividualReportCard = () => {
    const params = useParams()
    let reportCardDimensions: ReportCardDimesions[] = []

    const { data, isPending, error } = useFetchReportCardDatas(params.username ?? null)

    if (error) return <ErrorToast message={error.message} />
    if (isPending) return (<LoadingSpinner className="text-green-500 w-32 h-32" />)

    console.log(data?.repoData)

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

    //Collaboration
    const collaboration = collaborationFunc(
        data?.collab?.user?.contributionsCollection?.pullRequestReviewContributions,
        data?.openSource?.user?.pullRequests?.nodes,
        params.username!
    )
    reportCardDimensions.push(collaboration)

    //Open Source
    reportCardDimensions.push(openSourceFunc(data?.openSource?.user?.pullRequests?.nodes, params.username!))

    //Maintenance
    reportCardDimensions.push(maintenanceFunc(data?.repoData?.overview?.user?.repositories?.nodes))

    console.log(reportCardDimensions)

    //Calc overall grade
    const overallGrade = gradeCalculator([...reportCardDimensions.map((card)=> card.gradeScore)])
    

    return (
        <main className="flex flex-col py-5 px-4 md:px-0">
            <p className="text-graySubtextColor ">How you measure up as a developer and collaborator</p>

            {/* Overall score */}
            <Card className="gradientBg w-full md:max-w-2xl mx-auto py-8 px-4 my-12 flex flex-col items-center">
                {/* Grade  */}
                <div className="bg-[#161B22] size-[100px] flex items-center justify-center rounded-[12px]" style={{
                    border: `2px solid ${overallGrade?.color}`,
                    color: overallGrade?.color ?? ""
                }}>
                    <p className="font-extrabold text-6xl ">{overallGrade?.grade ?? "F"}</p>
                </div>
                <p className="tracking-wider font-semibold text-graySubtextColor uppercase pt-5">overall developer score</p>

                {/* Comment */}
                <p className="text-xl text-center text-white pt-3 max-w-md font-semibold">
                    {overallGrade?.grade === "A" && "You're performing exceptionally across all dimensions. Keep it up!"}
                    {overallGrade?.grade === "B" && "Solid performance overall. A few areas to polish and you're at the top."}
                    {overallGrade?.grade === "C" && "You're on a good track but there's meaningful room for improvement."}
                    {overallGrade?.grade === "D" && "Some dimensions need attention. Focus on consistency and collaboration."}
                    {overallGrade?.grade === "E" && "Several areas are underperforming. Small daily habits can turn this around."}
                    {overallGrade?.grade === "F" && "It's a tough start, but every expert was once a beginner. Keep pushing."}
                </p>

                {/* stat with grade */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full pt-5">
                    {reportCardDimensions.map((card: ReportCardDimesions, idx) => (
                        <span key={idx} className="font-semibold w-full uppercase text-xs text-center px-4 py-2.5 rounded-sm" style={{
                            backgroundColor: card.gradeColor ? `${card.gradeColor}22` : "",
                            border: `1px solid ${card.gradeColor}`,
                            color: card.gradeColor ?? ""
                        }}>
                            {card.label}: {card.grade}
                        </span>
                    ))}
                </div>
            </Card>

            {/* Each stat Score */}
            <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {reportCardDimensions.length > 0 && reportCardDimensions.map((report, idx) => (
                    <Card className={`border-none flex flex-col ${report.label === "Maintenance" ? "md:col-span-2" : ""}`} key={idx}>
                        <div className="bg-[#0D1117] flex flex-row items-center justify-between p-5 border border-[#20252C]">
                            <span className="gap-1 flex flex-col">
                                <p className="uppercase numbersFont text-xs font-semibold tracking-wider text-graySubtextColor">dimension 0{idx + 1}</p>
                                <p className="capitalize text-white font-semibold text-xl">{report.label}</p>
                            </span>
                            <p className="font-extrabold text-3xl" style={{
                                color: report.gradeColor ?? "#1F6FEB"
                            }}>{report.grade}</p>
                        </div>

                        {/* Regular stats */}
                        {Object.keys(report.stats).length > 0 && (
                            <div className="border border-[#20252C] flex flex-col divide-y divide-[#20252C]">
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
                        )}

                        {/* Bar stats */}
                        {report.bars && report.bars.length > 0 && (
                            <div className="border border-[#20252C] p-5 flex flex-col gap-5 md:flex-row md:gap-8">
                                {report.bars.map((bar) => (
                                    <div key={bar.label} className="flex flex-col gap-2 flex-1">
                                        <div className="flex justify-between items-center">
                                            <p className="text-graySubtextColor text-sm">{bar.label}</p>
                                            <p className="text-white text-sm numbersFont font-semibold">
                                                {bar.value}
                                                <span className="text-graySubtextColor font-light"> / {bar.total}</span>
                                            </p>
                                        </div>
                                        <div className="w-full h-[6px] rounded-full bg-[#30363D]">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${bar.total > 0 ? (bar.value / bar.total) * 100 : 0}%`,
                                                    backgroundColor: report.gradeColor ?? "#F85149"
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                ))}
            </section>



            {/* How to improve */}
            <section></section>
        </main>
    )
}

export default IndividualReportCard
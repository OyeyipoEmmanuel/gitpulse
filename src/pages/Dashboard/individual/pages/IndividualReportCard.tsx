import ErrorToast from "@/components/ui/error-toast"
import { LoadingSpinner } from "@/components/ui/spinner"
import { gradeCalculator } from "@/lib/gradeCalculator"
import { useFetchReportCardDatas } from "@/services/individualDashboardCalls/fetchReportCardDatas"
import type { CodeQualityNode, ReportCardDimesions, RepositoryNode } from "@/types"
import { useParams } from "react-router-dom"

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
        stats: {
            "Avg Pr Size": avgPrSize,
            "PR Merge Rate": `${prMergeRate.toFixed(0)}%`,
            "Avg PRs per repo": avgPRsPerRepo
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
    console.log(codeQuality)

    return (
        <main className="flex flex-col py-5 px-4 md:px-0">
            <p className="text-graySubtextColor ">How you measure up as a developer and collaborator</p>

            {/* Overall Score */}
            <section></section>

            {/* Each category score */}
            <section></section>

            {/* How to improve */}
            <section></section>
        </main>
    )
}

export default IndividualReportCard
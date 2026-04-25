import type { CompetencyLevelChartProps } from "@/types";


const CircularProgress = ({ value = 0 }: { value?: number }) => {
    const radius = 70;
    const stroke = 12;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;

    const strokeDashoffset =
        circumference - (value / 100) * circumference;

    return (
        <div className="flex items-center justify-center w-[128px] h-[128px] rounded-lg">
            <div className="relative">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="rotate-[-90deg]"
                >
                    {/* Background circle */}
                    <circle
                        stroke="#30363D"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                    />

                    {/* Progress circle */}
                    <circle
                        stroke="#238636"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="transition-all duration-500"
                    />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-4xl font-extrabold numbersFont">{value}</span>
                    <span className="text-xs pt-1 text-graySubtextColor">/100</span>
                </div>
            </div>
        </div>
    );
};

const Progress = ({ data }: { data: CompetencyLevelChartProps }) => {
    const total = data.totalCommitContributions + data.totalIssueContributions + data.totalPullRequestContributions + data.totalPullRequestReviewContributions

    const commitPercentage = (data.totalCommitContributions / total) * 100
    const issuePercentage = (data.totalIssueContributions / total) * 100
    const prPercentage = (data.totalPullRequestContributions / total) * 100
    const prReviewPercentage = (data.totalPullRequestReviewContributions / total) * 100

    const res = [
        { label: "Commits", percentage: commitPercentage.toFixed(0), color: "#238636" },
        { label: "PRs", percentage: issuePercentage.toFixed(0), color: "#1F6FEB" },
        { label: "Reviews", percentage: prPercentage.toFixed(0), color: "#7D8590" },
        { label: "Issues", percentage: prReviewPercentage.toFixed(0), color: "#F85149" },
    ]

    return (
        <div className="flex flex-col gap-4">
            {res.map((each, idx) => (
                <div className="grid grid-cols-3 gap-4 w-full items-center" key={idx}>
                    <p className="w-full text-graySubtextColor text-sm">{each.label}</p>
                    <div className="w-[96px] h-[6px] bg-[#30363D] rounded-full" >
                        <div className="h-full rounded-l-full" style={{
                            width: `${each.percentage}%`,
                            backgroundColor: `${each.color}`
                        }}></div>
                    </div>
                    <p className="w-full flex items-end justify-center text-white text-sm font-semibold">{each.percentage}%</p>
                </div>
            ))}

        </div>
    )
}

const CompetencyLevelCharts = ({ datas, consistencyScore }: { datas: CompetencyLevelChartProps, consistencyScore: number }) => {

    return (
        <main className="flex flex-col items-center md:flex-row md:justify-between gap-8">
            <CircularProgress value={consistencyScore} />
            <Progress data={datas}/>
        </main>
        

    )
}

export default CompetencyLevelCharts
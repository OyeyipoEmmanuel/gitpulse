interface RecentRepos {
    name: string;
    totalCount: number
}
const BarsForMostActiveRepos = ({ recentRepos }: { recentRepos: RecentRepos[] }) => {
    if (recentRepos.length == 0) return (
        <div className="py-12 text-[#238636] text-center mx-auto font-semibold text-xl">Not Enough Data.</div>
    )

    const total = recentRepos.reduce((acc, r) => acc + r.totalCount, 0)

    const reposWithPercentage = recentRepos
        .flatMap((repo) => ({
            name: repo.name,
            totalCount: repo.totalCount,
            percentage: Math.ceil((repo.totalCount / total) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage)

    console.log(reposWithPercentage)
    return (
        <div className="grid grid-cols-1 gap-5 mt-5">
            {reposWithPercentage && reposWithPercentage.map((repo, idx) => (
                <section className="" key={idx}>
                    <div className="flex justify-between items-center pb-3">
                        <p className="text-white">{repo.name}</p>
                        <p className="text-[#238636] numbersFont tracking-tighter">{repo.totalCount} commits</p>
                    </div>

                    <div className="w-[100%] h-2 bg-[#010409] rounded-full">
                        <div className="h-full bg-[#238636] rounded-full" style={{ width: `${repo.percentage}%` }}></div>
                    </div>
                </section>
            ))}
        </div>
    )
}

export default BarsForMostActiveRepos
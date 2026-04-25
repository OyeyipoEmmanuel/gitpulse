import { useFetchProductivityDatas } from "@/services/individualDashboardCalls/fetchProductivityDatas";
import Card from "../components/Card"
import { FaFire } from "react-icons/fa";
import { IoIosFlash } from "react-icons/io";
import { useParams } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/spinner";
import ErrorToast from "@/components/ui/error-toast";
import CompetencyLevelCharts from "../components/CompetencyLevelCharts";
import type { YoYReview } from "@/types";
import { MostProductiveDaysChart, HourlyPerformanceChart } from "@/components/charts";


function getCurrentStreak(daysArr: { contributionCount: number, date: string }[]) {
    if (daysArr.length === 0) return 0
    let count = 0
    let i = daysArr.length - 1

    // Skip today if no contributions yet — streak may still be alive
    if (daysArr[i].contributionCount === 0) i--

    while (i >= 0 && daysArr[i].contributionCount > 0) {
        count++
        i--
    }

    return count
}

function getLongestStreak(daysArr: { contributionCount: number, date: string }[]) {
    if (daysArr.length === 0) return { count: 0, from: null, to: null }
    let max = 0
    let count = 0
    let start = 0
    let bestFrom: string | null = null
    let bestTo: string | null = null

    for (let i = 0; i < daysArr.length; i++) {
        if (daysArr[i].contributionCount > 0) {
            if (count === 0) start = i
            count++
        } else {
            if (count > max) {
                max = count
                bestFrom = daysArr[start].date
                bestTo = daysArr[i - 1].date
            }
            count = 0
        }
    }

    if (count > max) {
        max = count
        bestFrom = daysArr[start].date
        bestTo = daysArr[daysArr.length - 1].date
    }

    return { count: max, from: bestFrom, to: bestTo }
}

function formatDate(dateStr: string) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function calculateConsistencyScore(weeks: any[]) {
    // const days = weeks.flatMap(w => w.contributionDays)

    // only count days up to today (calendar includes future days)
    const today = new Date()
    const pastDays = weeks.filter(d => new Date(d.date) <= today)

    const totalDays = pastDays.length
    const activeDays = pastDays.filter(d => d.contributionCount > 0).length

    const score = Math.round((activeDays / totalDays) * 100)

    let remark: string = ""
    let color: string = ""

    if (score >= 80) { remark = "Very Consistent"; color = "#22C55E" }
    else if (score >= 60) { remark = "Consistent"; color = "#84CC16" }
    else if (score >= 50) { remark = "Average"; color = "#EAB308" }
    else if (score >= 30) { remark = "Poor"; color = "#F97316" }
    else { remark = "Very Poor"; color = "#EF4444" }

    return { score, remark, color }
}

function yoyReview(datas: YoYReview) {
    const lastYearContribution = datas?.user?.lastYear?.contributionCalendar?.totalContributions

    const thisYearContribution = datas?.user?.thisYear?.contributionCalendar?.totalContributions


    const percentage: number | 0 = lastYearContribution === 0
        ? (thisYearContribution > 0 ? 100 : 0)
        : (((thisYearContribution - lastYearContribution) / lastYearContribution) * 100)

    const now = new Date()
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    const thisYearDate = fmt(now)
    const lastYearDate = fmt(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()))

    return { percentage, lastYearContribution, thisYearContribution, thisYearDate, lastYearDate }
}

const IndividualProductivity = () => {
    const params = useParams()

    const { data, isPending, error } = useFetchProductivityDatas(params.username ?? null)

    if (error) return <ErrorToast message={error.message} />
    if (isPending) return <LoadingSpinner className="text-green-500 w-32 h-32" />

    console.log(data.yoyReview)


    const daysOfStreaks = data?.getStreak?.user?.contributionsCollection?.contributionCalendar?.weeks?.flatMap((w: any) => w.contributionDays)

    const last12MonthsDays = data?.consistencyData?.user?.contributionsCollection?.contributionCalendar?.weeks?.flatMap((w: any) => w.contributionDays)

    const longestStreak = getLongestStreak(daysOfStreaks)

    const consistencyScore = calculateConsistencyScore(last12MonthsDays)
    console.log(consistencyScore)

    const yoy = yoyReview(data?.yoyReview)

    // Most Productive Days — aggregate contributions by day of week
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

    // Hourly Performance — aggregate events by hour of day
    const hourTotals = new Array(24).fill(0)
    const events = Array.isArray(data?.eventsData) ? data.eventsData : []
    events.forEach((event: { created_at: string }) => {
        if (event.created_at) {
            const hour = new Date(event.created_at).getHours()
            hourTotals[hour]++
        }
    })
    const hourlyData = hourTotals.map((count, hour) => ({
        hour: hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`,
        events: count
    }))

    return (
        <main className="py-4 px-4 md:px-0 flex flex-col gap-6">
            <section className="flex flex-col gap-5 md:flex-row w-full">

                <div className="flex flex-col gap-5 md:w-[30%]">
                    {/* Longest Stream */}
                    <Card className="p-5 flex flex-col gap-8 justify-between w-full min-h-[160px]">
                        <span className="flex flex-row justify-between items-center">
                            <p className="text-graySubtextColor uppercase font-extrabold tracking-widest text-xs">Longest streak</p>
                            <FaFire className="text-secondaryTextColor" />
                        </span>

                        <div className="flex flex-col">
                            <span className="flex space-x-1">
                                <p className="text-white text-[36px] numbersFont font-extrabold">{longestStreak.count}</p>
                                <p className="font-light text-graySubtextColor self-center">days</p>
                            </span>
                            <p className="text-graySubtextColor text-sm">
                                Achieved {longestStreak.from && longestStreak.to
                                    ? `${formatDate(longestStreak.from)} - ${formatDate(longestStreak.to)}`
                                    : 'Achieved'}
                            </p>
                        </div>
                    </Card>

                    {/* Current Streak */}
                    <Card className="p-5 flex flex-col gap-8 justify-between w-full min-h-[160px]">
                        <span className="flex flex-row justify-between items-center">
                            <p className="text-graySubtextColor uppercase font-extrabold tracking-widest text-xs">current streak</p>
                            <IoIosFlash className="text-secondaryTextColor" />
                        </span>

                        <div className="flex flex-col">
                            <span className="flex space-x-1">
                                <p className="text-white text-[36px] numbersFont font-extrabold">{getCurrentStreak(daysOfStreaks)}</p>
                                <p className="text-lg font-light text-graySubtextColor self-center">days</p>
                            </span>
                            <p className="text-graySubtextColor text-sm">Keep going! </p>
                        </div>
                    </Card>
                </div>

                {/* Consistency Score */}
                <Card className="md:w-[40%] h-fit p-5 flex flex-col gap-18">
                    <div>
                        <span className="flex justify-between items-center">
                            <p className="text-white text-lg font-semibold">Consistency Score</p>
                            <p className="uppercase text-sm px-3 py-0.5 font-semibold rounded-md" style={{
                                color: consistencyScore.color,
                                backgroundColor: `${consistencyScore.color}22`,
                            }}>{consistencyScore.remark}</p>
                        </span>
                        <p className="text-xs flex gap-1 text-graySubtextColor pt-2">Based on your contribution activity over the <span className="text-secondaryTextColor font-extrabold">last 12 months</span></p>
                    </div>


                    <div className="flex flex-col items-center justify-center md:flex-row md:justify-start">
                        <CompetencyLevelCharts datas={data?.consistencyData?.user?.contributionsCollection} consistencyScore={consistencyScore.score} />
                    </div>
                </Card>

                {/* YoY Performance */}
                <Card className="md:w-[30%] h-fit p-5">
                    <span>
                        <p className="text-white text-lg">This time last year</p>
                        <p className="text-xs text-graySubtextColor pt-2">How you compare to the same period last year</p>
                    </span>

                    <div className="flex flex-col gap-2 pt-6">
                        <span>
                            <p className="text-[12px] uppercase text-graySubtextColor tracking-wider font-semibold">Total Jan - {yoy.thisYearDate}</p>
                            <p className="text-white font-semibold text-4xl numbersFont">{yoy.thisYearContribution}</p>
                        </span>

                        <div className="flex flex-col self-end items-center justify-center px-7 py-3 w-fit rounded-md" style={{
                            backgroundColor: `${yoy.percentage < 0 ? "#2A1D24" : "#172524"}`,
                            border: `2px solid ${yoy.percentage < 0 ? "#442429" : "#193127"}`
                        }}>
                            <p className="text-center font-extrabold numbersFont text-4xl tracking-tighter" style={{
                                color: `${yoy.percentage < 0 ? "#F85149" : "#238636"}`,
                            }}>{yoy.percentage < 0 ? "" : "+"}{yoy.percentage.toFixed(0)}%</p>

                            <p className="text-center font-semibold text-[14px] uppercase" style={{
                                color: `${yoy.percentage < 0 ? "#F85149" : "#238636"}`,
                            }} >{yoy.percentage < 0 ? "decline" : "growth"}</p>

                        </div>

                        <span>
                            <p className="text-[12px] uppercase text-graySubtextColor tracking-wider font-semibold">Total {yoy.lastYearDate} - Dec</p>
                            <p className="text-3xl numbersFont text-graySubtextColor">{yoy.lastYearContribution}</p>
                        </span>





                    </div>
                </Card>
            </section>

            <section className="flex flex-col gap-5 md:flex-row w-full">
                <div className="md:w-1/2">
                    <MostProductiveDaysChart data={mostProductiveDaysData} />
                </div>
                <div className="md:w-1/2">
                    <HourlyPerformanceChart data={hourlyData} />
                </div>
            </section>
        </main>
    )
}

export default IndividualProductivity
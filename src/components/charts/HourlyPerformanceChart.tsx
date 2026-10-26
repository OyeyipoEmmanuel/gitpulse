import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import Card from "@/pages/Dashboard/individual/components/Card"
import MetricTooltip from "@/components/ui/metric-tooltip"

interface HourlyPerformanceChartProps {
  data: { hour: string; events: number }[]
}

const HourlyPerformanceChart = ({ data }: HourlyPerformanceChartProps) => {
  const summary = data.filter(item => item.events > 0).map(item => `${item.hour}: ${item.events}`).join(", ") || "No recent public events"
  return (
    <Card className="p-5 flex flex-col gap-4 w-full">
      <div>
        <div className="flex items-center gap-1"><p className="text-white text-lg font-semibold">Hourly Performance</p><MetricTooltip label="Hourly Performance">Calculated from up to 300 recent public GitHub events. Times are displayed in your local timezone.</MetricTooltip></div>
        <p className="text-xs flex gap-1 text-graySubtextColor pt-2">
          Based on up to <span className="text-secondaryTextColor font-extrabold">300 recent public GitHub events</span>
        </p>
      </div>

      <div role="img" aria-label={`Public GitHub events by hour. ${summary}`} className="w-full">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={data}
          margin={{ left: -20, top: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#238636" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#238636" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="hour"
            tick={{ fill: "#8B949E", fontSize: 10 }}
            interval={2}
            axisLine={{ stroke: "#30363D" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#8B949E", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [value, "Events"]}
            contentStyle={{
              background: "#161B22",
              border: "1px solid #30363D",
              borderRadius: "6px",
              color: "#e6edf3",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#e6edf3" }}
            itemStyle={{ color: "#238636" }}
          />
          <Area
            type="monotone"
            dataKey="events"
            stroke="#238636"
            fill="url(#hourlyGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </Card>
  )
}

export default HourlyPerformanceChart

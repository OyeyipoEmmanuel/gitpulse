import { Bar, BarChart, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts"
import Card from "@/pages/Dashboard/individual/components/Card"

interface MostProductiveDaysChartProps {
  data: { day: string; contributions: number }[]
}

const MostProductiveDaysChart = ({ data }: MostProductiveDaysChartProps) => {
  const maxContributions = Math.max(...data.map(d => d.contributions))

  return (
    <Card className="p-5 flex flex-col gap-4 w-full">
      <div>
        <p className="text-white text-lg font-semibold">Most Productive Days</p>
        <p className="text-xs flex gap-1 text-graySubtextColor pt-2">
          Based on your contribution activity over the{" "}
          <span className="text-secondaryTextColor font-extrabold">past 12 months</span>
        </p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ left: -20, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tick={{ fill: "#8b949e", fontSize: 12 }}
            axisLine={{ stroke: "#30363d" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#8b949e", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [value, "Contributions"]}
            contentStyle={{
              background: "#161b22",
              border: "1px solid #30363d",
              borderRadius: "6px",
              color: "#e6edf3",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#e6edf3" }}
            itemStyle={{ color: "#238636" }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="contributions" barSize={36} radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.day}
                fill={entry.contributions === maxContributions ? "#238636" : "#1a3525"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

export default MostProductiveDaysChart

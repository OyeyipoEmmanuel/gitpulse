import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

type PrStatusEntry = {
  name: string
  value: number
  fill: string
}

const PrStatusPieChart = ({ data }: { data: PrStatusEntry[] }) => {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          labelLine={false}
        />
        <Tooltip
          formatter={(value, name) => [value ?? 0, name]}
          contentStyle={{ backgroundColor: "#161B22", border: "1px solid #23282E", borderRadius: 6 }}
          labelStyle={{ color: "#8B949E" }}
          itemStyle={{ color: "#fff" }}
        />
        <Legend
          formatter={(value) => <span style={{ color: "#8B949E", fontSize: 13 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default PrStatusPieChart

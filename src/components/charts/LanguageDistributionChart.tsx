import { Bar, BarChart, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";

const LanguageDistributionChart = ({ data }: {
  data: {
    language: string;
    percentage: number;
    color: string
  }[]
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ bottom: 40, left:-20 }} >
        <XAxis
          dataKey="language"
          tick={{ fill: "#8b949e", fontSize: 11 }}
          angle={-45} 
          textAnchor="end"      
          interval={0}          
        />
        <YAxis tick={{ fill: "#8b949e", fontSize: 11 }} unit="%" />
        <Tooltip
          formatter={(value) => [`${value}%`, "Usage"]}
          contentStyle={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: "6px",
            color: "#e6edf3",
            fontSize: "12px",
          }}
          labelStyle={{ color: "#e6edf3" }}
          itemStyle={{ color: "#e6edf3" }}
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
        />
        <Bar dataKey="percentage" barSize={40}>
          {data.map((entry) => (
            <Cell key={entry.language} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default LanguageDistributionChart
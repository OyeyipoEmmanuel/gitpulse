import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

// #endregion
const StarsGrowthAreaChart = ({ data }: { data: { date: string; stars: number | unknown }[] }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>

            <AreaChart
                responsive
                data={data}
                margin={{
                    top: 20,
                    right: 0,
                    left: 0,
                    bottom: 20,
                }}
                onContextMenu={(_, e) => e.preventDefault()}
            >
                <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleString("default", { month: "short", day: "numeric" })}
                    interval="preserveStartEnd"
                    angle={-5}
                    textAnchor="end"
                    tick={{ fontSize: 11, fill: "#8B949E" }}
                    height={50}
                />

                <Tooltip
                    formatter={(value) => [value, "Stars"]}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    contentStyle={{
                        padding: "10px",
                        background: "#161b22",
                        border: "1px solid #30363d",
                        borderRadius: "6px",
                        color: "#e6edf3",
                        fontSize: "16px",
                    }}
                    labelStyle={{ color: "#e6edf3" }}
                    itemStyle={{ color: "#e6edf3" }}
                />
                <Area
                    type="monotone"
                    dataKey="stars"
                    stroke="#238636"
                    fill="#182C26"
                    strokeWidth={4}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default StarsGrowthAreaChart;
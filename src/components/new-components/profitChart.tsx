import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { date: "Jul 20", profit: 0.5, total: 1.2 },
  { date: "Jul 21", profit: 0.9, total: 1.6 },
  { date: "Jul 22", profit: 0.7, total: 1.4 },
  { date: "Jul 23", profit: 1.2, total: 2.03 },
  { date: "Jul 24", profit: 0.8, total: 1.7 },
  { date: "Jul 25", profit: 1.5, total: 2.5 },
  { date: "Jul 26", profit: 1.9, total: 3.0 },
];

// Compute the gap for the hatched area starting from profit
const withGap = data.map((d) => ({
  ...d,
  gap: d.total - d.profit, // the height of the area
  profit: d.profit, // bottom line
  total: d.total, // top line
}));

const ProfitChart = () => {
  return (
    <div className="w-full flex flex-col gap-[8px]">
      <div className="w-full flex flex-col gap-[0.5px]">
        <div>
          {/* date */}
          <p>20 jul - 26 jul , 2025</p>
        </div>
        <div className="w-full h-[300px]">
          <ResponsiveContainer>
            <ComposedChart
              data={withGap}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                {/* Profit gradient */}
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff7f" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#00ff7f" stopOpacity={0} />
                </linearGradient>

                {/* Total gradient */}
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8a2be2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8a2be2" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis hide />
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                opacity={0.1}
              />
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: "#1e1e2f",
                  borderRadius: "8px",
                  border: "none",
                }}
              />

              {/* Total area */}
              <Area
                type="linear"
                dataKey="total"
                stroke="#8a2be2"
                fill="url(#totalGradient)"
                strokeWidth={2}
              />

              {/* Profit area */}
              <Area
                type="linear"
                dataKey="profit"
                stroke="#00ff7f"
                fill="url(#profitGradient)"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* current profit */}
      <div className="flex items-center gap-[4px]">
        <div className="w-[12px] h-[12px] bg-[#63E465] rounded-[4px]"></div>
        <p>Current Profit</p>
      </div>
    </div>
  );
};

export default ProfitChart;

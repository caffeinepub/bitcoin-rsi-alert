import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDataPoint } from "../hooks/useQueries";
import type { DivergenceResult } from "../types";

interface MACDChartProps {
  data: ChartDataPoint[];
  height?: number;
  divergence?: DivergenceResult;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload as ChartDataPoint;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-xl">
      <p className="font-mono text-xs text-muted-foreground mb-1.5">{label}</p>
      <div className="space-y-1">
        {entry.macd !== null && (
          <div className="flex items-center justify-between gap-4">
            <span
              className="font-mono text-[11px]"
              style={{ color: "#22d3ee" }}
            >
              MACD
            </span>
            <span
              className="font-mono text-sm font-bold"
              style={{ color: "#22d3ee" }}
            >
              {entry.macd.toFixed(0)}
            </span>
          </div>
        )}
        {entry.signal !== null && (
          <div className="flex items-center justify-between gap-4">
            <span
              className="font-mono text-[11px]"
              style={{ color: "oklch(0.72 0.18 55)" }}
            >
              SIG
            </span>
            <span
              className="font-mono text-sm font-bold"
              style={{ color: "oklch(0.72 0.18 55)" }}
            >
              {entry.signal.toFixed(0)}
            </span>
          </div>
        )}
        {entry.histogram !== null && (
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[11px] text-muted-foreground">
              HIST
            </span>
            <span
              className="font-mono text-sm font-bold"
              style={{ color: entry.histogram >= 0 ? "#22c55e" : "#ef4444" }}
            >
              {entry.histogram >= 0 ? "+" : ""}
              {entry.histogram.toFixed(0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function MACDChart({ data, height, divergence }: MACDChartProps) {
  const divColor = divergence?.type === "bullish" ? "#22c55e" : "#ef4444";

  const renderDot = (props: any) => {
    const { cx, cy, index } = props;
    if (
      divergence &&
      (index === divergence.prevIndex || index === divergence.currIndex)
    ) {
      return (
        <circle
          key={`macd-div-dot-${index}`}
          cx={cx}
          cy={cy}
          r={6}
          fill={divColor}
          stroke="oklch(0.12 0.018 264)"
          strokeWidth={2}
        />
      );
    }
    return (
      <circle key={`macd-dot-${index}`} cx={cx} cy={cy} r={0} fill="none" />
    );
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height ?? 140}>
        <ComposedChart
          data={data}
          syncId="btc-charts"
          margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(0.2 0.025 264)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{
              fontSize: 9,
              fill: "oklch(0.55 0.01 220)",
              fontFamily: "JetBrains Mono",
            }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{
              fontSize: 9,
              fill: "oklch(0.55 0.01 220)",
              fontFamily: "JetBrains Mono",
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toFixed(0)}
            width={40}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "oklch(0.55 0.01 220 / 0.4)", strokeWidth: 1 }}
          />
          <ReferenceLine y={0} stroke="oklch(0.35 0.01 220)" strokeWidth={1} />
          <Bar dataKey="histogram" maxBarSize={6}>
            {data.map((entry) => (
              <Cell
                key={entry.date}
                fill={(entry.histogram ?? 0) >= 0 ? "#22c55e" : "#ef4444"}
                fillOpacity={0.7}
              />
            ))}
          </Bar>
          <Line
            type="monotone"
            dataKey="macd"
            stroke="#22d3ee"
            strokeWidth={1.5}
            dot={renderDot}
            connectNulls
            activeDot={{ r: 3, fill: "#22d3ee", strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="signal"
            stroke="oklch(0.72 0.18 55)"
            strokeWidth={1.5}
            dot={false}
            connectNulls
            activeDot={{ r: 3, fill: "oklch(0.72 0.18 55)", strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

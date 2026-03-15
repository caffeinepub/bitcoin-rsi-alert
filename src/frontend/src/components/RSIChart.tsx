import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDataPoint } from "../hooks/useQueries";
import type { DivergenceResult } from "../types";

interface RSIChartProps {
  data: ChartDataPoint[];
  height?: number;
  divergence?: DivergenceResult;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const rsi = payload[0]?.value as number | null;
  if (rsi === null || rsi === undefined) return null;
  const color =
    rsi > 70 ? "#ef4444" : rsi < 30 ? "#22c55e" : "oklch(0.72 0.18 55)";
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl">
      <p className="font-mono text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-mono text-sm font-bold" style={{ color }}>
        RSI {rsi.toFixed(1)}
      </p>
    </div>
  );
}

export function RSIChart({ data, height, divergence }: RSIChartProps) {
  const rsiValues = data
    .map((d) => d.rsi)
    .filter((v): v is number => v !== null);
  const minRsi = rsiValues.length ? Math.min(...rsiValues) : 20;
  const maxRsi = rsiValues.length ? Math.max(...rsiValues) : 80;
  const domainMin = Math.max(0, Math.floor(minRsi - 8));
  const domainMax = Math.min(100, Math.ceil(maxRsi + 8));

  const ticks = [30, 50, 70].filter((t) => t >= domainMin && t <= domainMax);

  const obTop = Math.min(100, domainMax);
  const obBot = Math.min(70, domainMax);
  const osTop = Math.max(30, domainMin);
  const osBot = Math.max(0, domainMin);
  const neutTop = Math.min(70, domainMax);
  const neutBot = Math.max(30, domainMin);

  // Custom dot renderer — shows large colored circles at divergence swing points
  const divColor = divergence?.type === "bullish" ? "#22c55e" : "#ef4444";

  const renderDot = (props: any) => {
    const { cx, cy, index } = props;
    if (
      divergence &&
      (index === divergence.prevIndex || index === divergence.currIndex)
    ) {
      return (
        <circle
          key={`rsi-div-dot-${index}`}
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
      <circle key={`rsi-dot-${index}`} cx={cx} cy={cy} r={0} fill="none" />
    );
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height ?? 140}>
        <LineChart
          data={data}
          syncId="btc-charts"
          margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
        >
          {neutTop > neutBot && (
            <ReferenceArea
              y1={neutBot}
              y2={neutTop}
              fill="oklch(0.5 0 0 / 0.06)"
              fillOpacity={1}
              stroke="none"
            />
          )}
          {obBot < obTop && (
            <ReferenceArea
              y1={obBot}
              y2={obTop}
              fill="#ef4444"
              fillOpacity={0.08}
              stroke="none"
            />
          )}
          {osBot < osTop && (
            <ReferenceArea
              y1={osBot}
              y2={osTop}
              fill="#22c55e"
              fillOpacity={0.08}
              stroke="none"
            />
          )}

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
            domain={[domainMin, domainMax]}
            ticks={ticks}
            tick={{
              fontSize: 9,
              fill: "oklch(0.55 0.01 220)",
              fontFamily: "JetBrains Mono",
            }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "oklch(0.55 0.01 220 / 0.4)", strokeWidth: 1 }}
          />
          {domainMin <= 70 && domainMax >= 70 && (
            <ReferenceLine
              y={70}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1}
              strokeOpacity={0.5}
            />
          )}
          <ReferenceLine
            y={50}
            stroke="oklch(0.4 0.01 220)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          {domainMin <= 30 && domainMax >= 30 && (
            <ReferenceLine
              y={30}
              stroke="#22c55e"
              strokeDasharray="4 4"
              strokeWidth={1}
              strokeOpacity={0.5}
            />
          )}
          <Line
            type="monotone"
            dataKey="rsi"
            stroke="oklch(0.78 0.18 80)"
            strokeWidth={2}
            dot={renderDot}
            connectNulls
            activeDot={{ r: 4, fill: "oklch(0.78 0.18 80)", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

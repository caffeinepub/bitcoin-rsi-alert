import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDataPoint } from "../hooks/useQueries";

interface PriceChartProps {
  data: ChartDataPoint[];
  currentSma20: number;
  height?: number;
}

function formatPrice(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
  return `$${v.toFixed(0)}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as ChartDataPoint;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-xl">
      <p className="font-mono text-xs text-muted-foreground mb-1.5">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] text-muted-foreground">
            CLOSE
          </span>
          <span className="font-mono text-sm font-bold text-primary">
            ${d.close.toLocaleString()}
          </span>
        </div>
        {d.sma20 && (
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[11px] text-muted-foreground">
              SMA20
            </span>
            <span className="font-mono text-sm text-accent">
              ${d.sma20.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] text-muted-foreground">
            H/L
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            ${d.high.toLocaleString()} / ${d.low.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function PriceChart({ data, currentSma20, height }: PriceChartProps) {
  const prices = data.map((d) => d.close);
  const min = Math.min(...prices) * 0.98;
  const max = Math.max(...prices) * 1.02;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height ?? 220}>
        <ComposedChart
          data={data}
          syncId="btc-charts"
          margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
            domain={[min, max]}
            tick={{
              fontSize: 9,
              fill: "oklch(0.55 0.01 220)",
              fontFamily: "JetBrains Mono",
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatPrice}
            width={46}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "oklch(0.55 0.01 220 / 0.4)", strokeWidth: 1 }}
          />
          <ReferenceLine
            y={currentSma20}
            stroke="#22d3ee"
            strokeDasharray="4 4"
            strokeWidth={1}
            strokeOpacity={0.5}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#f97316", strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="sma20"
            stroke="#22d3ee"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

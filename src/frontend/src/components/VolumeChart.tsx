import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDataPoint } from "../hooks/useQueries";

interface VolumeChartProps {
  data: ChartDataPoint[];
  height?: number;
}

function formatVol(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toFixed(0);
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload as ChartDataPoint;
  const volUsd = entry.volume * entry.close;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-xl">
      <p className="font-mono text-xs text-muted-foreground mb-1.5">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] text-muted-foreground">
            VOL
          </span>
          <span className="font-mono text-sm font-bold text-foreground">
            {formatVol(entry.volume)} BTC
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] text-muted-foreground">
            USD
          </span>
          <span className="font-mono text-sm font-bold text-primary">
            ${formatVol(volUsd)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function VolumeChart({ data, height }: VolumeChartProps) {
  const avg = data.length
    ? data.reduce((s, d) => s + d.volume, 0) / data.length
    : 1;
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height ?? 100}>
        <BarChart
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
            tickFormatter={formatVol}
            width={36}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "oklch(0.55 0.01 220 / 0.08)" }}
          />
          <Bar dataKey="volume" maxBarSize={8} radius={[2, 2, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.date}
                fill={
                  entry.volume >= avg * 1.5
                    ? "oklch(0.72 0.18 55)"
                    : entry.volume >= avg
                      ? "oklch(0.78 0.15 200)"
                      : "oklch(0.4 0.04 264)"
                }
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

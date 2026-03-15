import { Area, AreaChart, Brush, ResponsiveContainer, XAxis } from "recharts";
import type { ChartDataPoint } from "../hooks/useQueries";

interface ChartNavigatorProps {
  data: ChartDataPoint[];
  startIndex: number;
  endIndex: number;
  onBrushChange: (start: number, end: number) => void;
}

export function ChartNavigator({
  data,
  startIndex,
  endIndex,
  onBrushChange,
}: ChartNavigatorProps) {
  return (
    <div className="w-full px-2 pb-3">
      <div className="font-mono text-[9px] tracking-widest text-muted-foreground/50 uppercase mb-1 px-2">
        SCROLL RANGE
      </div>
      <ResponsiveContainer width="100%" height={60}>
        <AreaChart
          data={data}
          margin={{ top: 0, right: 8, bottom: 0, left: 50 }}
        >
          <defs>
            <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <Area
            type="monotone"
            dataKey="close"
            stroke="#f97316"
            strokeWidth={1}
            strokeOpacity={0.5}
            fill="url(#navGradient)"
            dot={false}
            isAnimationActive={false}
          />
          <Brush
            dataKey="date"
            startIndex={startIndex}
            endIndex={endIndex}
            height={30}
            stroke="oklch(0.35 0.04 264)"
            fill="oklch(0.12 0.02 264)"
            travellerWidth={8}
            onChange={(range) => {
              if (
                range &&
                typeof range.startIndex === "number" &&
                typeof range.endIndex === "number"
              ) {
                onBrushChange(range.startIndex, range.endIndex);
              }
            }}
          >
            <AreaChart>
              <Area
                type="monotone"
                dataKey="close"
                stroke="#f97316"
                strokeWidth={1}
                strokeOpacity={0.3}
                fill="none"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </Brush>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

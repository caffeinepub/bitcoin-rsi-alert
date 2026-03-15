import { useEffect, useRef } from "react";

interface RSIGaugeProps {
  value: number;
  size?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function getRsiColor(rsi: number): string {
  if (rsi < 30) return "#ef4444";
  if (rsi < 70) return "#eab308";
  return "#22c55e";
}

function getRsiLabel(rsi: number): string {
  if (rsi < 30) return "OVERSOLD";
  if (rsi < 70) return "NEUTRAL";
  return "OVERBOUGHT";
}

const SEGMENT_COLORS = ["#ef4444", "#eab308", "#22c55e"];

export function RSIGauge({ value, size = 280 }: RSIGaugeProps) {
  const needleRef = useRef<SVGLineElement>(null);
  const prevValueRef = useRef(value);

  const cx = size / 2;
  const cy = size * 0.58;
  const outerR = size * 0.43;
  const innerR = size * 0.32;
  const trackR = (outerR + innerR) / 2;
  const strokeWidth = outerR - innerR;

  const rsiToAngle = (rsi: number) => 180 + (rsi / 100) * 180;
  const targetAngle = rsiToAngle(Math.max(0, Math.min(100, value)));

  const needleLength = outerR * 1.05;
  const needleAngleDeg = targetAngle - 270;

  useEffect(() => {
    const el = needleRef.current;
    if (!el) return;
    el.style.transformOrigin = `${cx}px ${cy}px`;
    el.style.transform = `rotate(${needleAngleDeg}deg)`;
    prevValueRef.current = value;
  }, [value, needleAngleDeg, cx, cy]);

  const color = getRsiColor(value);
  const label = getRsiLabel(value);

  const redStart = rsiToAngle(0);
  const redEnd = rsiToAngle(30);
  const yellowEnd = rsiToAngle(70);
  const greenEnd = rsiToAngle(100);

  const segmentData = [
    { start: redStart, end: redEnd, linecap: "round" as const },
    { start: redEnd, end: yellowEnd, linecap: "butt" as const },
    { start: yellowEnd, end: greenEnd, linecap: "round" as const },
  ];

  const needleRad = ((targetAngle - 90) * Math.PI) / 180;
  const nx = cx + needleLength * Math.cos(needleRad);
  const ny = cy + needleLength * Math.sin(needleRad);

  return (
    <div className="flex flex-col items-center">
      <svg
        role="img"
        aria-label={`RSI Gauge showing ${value.toFixed(1)} — ${label}`}
        width={size}
        height={size * 0.65}
        viewBox={`0 0 ${size} ${size * 0.65}`}
        className="overflow-visible"
      >
        <defs>
          <filter id="glow-needle">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-track">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track background */}
        <path
          d={describeArc(cx, cy, trackR, 180, 360)}
          fill="none"
          stroke="oklch(0.2 0.025 264)"
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
        />

        {/* Colored segments */}
        {segmentData.map((seg, i) => (
          <path
            key={SEGMENT_COLORS[i]}
            d={describeArc(cx, cy, trackR, seg.start, seg.end)}
            fill="none"
            stroke={SEGMENT_COLORS[i]}
            strokeWidth={strokeWidth}
            strokeLinecap={seg.linecap}
            opacity={0.85}
            filter="url(#glow-track)"
          />
        ))}

        {/* Tick marks */}
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => {
          const a = rsiToAngle(tick);
          const rad = ((a - 90) * Math.PI) / 180;
          const inner = outerR + 6;
          const outer2 = outerR + (tick % 30 === 0 ? 14 : 9);
          const x1 = cx + inner * Math.cos(rad);
          const y1 = cy + inner * Math.sin(rad);
          const x2 = cx + outer2 * Math.cos(rad);
          const y2 = cy + outer2 * Math.sin(rad);
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={
                tick % 30 === 0 ? "oklch(0.6 0.02 264)" : "oklch(0.3 0.02 264)"
              }
              strokeWidth={tick % 30 === 0 ? 2 : 1}
            />
          );
        })}

        {/* Tick labels */}
        {[0, 30, 50, 70, 100].map((tick) => {
          const a = rsiToAngle(tick);
          const rad = ((a - 90) * Math.PI) / 180;
          const lr = outerR + 22;
          const tx = cx + lr * Math.cos(rad);
          const ty = cy + lr * Math.sin(rad);
          return (
            <text
              key={tick}
              x={tx}
              y={ty}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size * 0.045}
              fill="oklch(0.5 0.01 264)"
              fontFamily="JetBrains Mono, monospace"
            >
              {tick}
            </text>
          );
        })}

        {/* Needle */}
        <line
          ref={needleRef}
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke="oklch(0.78 0.15 200)"
          strokeWidth={3}
          strokeLinecap="round"
          filter="url(#glow-needle)"
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: `rotate(${needleAngleDeg}deg)`,
            transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />

        {/* Needle base dot */}
        <circle
          cx={cx}
          cy={cy}
          r={size * 0.028}
          fill="oklch(0.78 0.15 200)"
          filter="url(#glow-needle)"
        />
        <circle cx={cx} cy={cy} r={size * 0.015} fill="oklch(0.08 0.012 264)" />
      </svg>

      {/* RSI Value Display */}
      <div className="flex flex-col items-center -mt-2">
        <span
          className="font-mono text-5xl font-bold tracking-tight"
          style={{ color }}
        >
          {value.toFixed(1)}
        </span>
        <span
          className="text-xs font-mono font-semibold tracking-[0.2em] mt-1 uppercase"
          style={{ color }}
        >
          {label}
        </span>
        <span className="text-muted-foreground text-xs tracking-widest mt-1 uppercase font-mono">
          RSI · 14D
        </span>
      </div>
    </div>
  );
}

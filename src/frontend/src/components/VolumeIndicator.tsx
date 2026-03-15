import { Skeleton } from "@/components/ui/skeleton";
import { BarChart2 } from "lucide-react";
import { useVolume } from "../hooks/useVolume";

function formatVolume(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  return `$${v.toFixed(0)}`;
}

// Typical daily BTC/USDT volume reference ~30B USD
const VOLUME_REF = 30_000_000_000;

export function VolumeIndicator() {
  const { volume, isLoading } = useVolume();
  const pct = Math.min((volume / VOLUME_REF) * 100, 100);

  // Color based on relative volume
  const barColor =
    pct >= 80
      ? "oklch(0.72 0.18 55)"
      : pct >= 50
        ? "oklch(0.78 0.15 200)"
        : "oklch(0.55 0.01 220)";

  return (
    <div
      data-ocid="volume.card"
      className="rounded-xl border border-border bg-card card-glow px-6 py-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
              24H Volume
            </span>
          </div>

          {isLoading ? (
            <div data-ocid="volume.loading_state">
              <Skeleton className="h-10 w-36 mb-3 bg-muted/60" />
              <Skeleton className="h-1.5 w-full rounded-full bg-muted/40" />
            </div>
          ) : (
            <>
              <p className="font-mono text-4xl font-bold tracking-tight text-foreground">
                {volume > 0 ? formatVolume(volume) : "—"}
              </p>

              {/* Volume bar */}
              <div className="mt-3">
                <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: barColor,
                      boxShadow: `0 0 8px ${barColor}`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-mono text-[10px] text-muted-foreground/50">
                    LOW
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/50">
                    {pct.toFixed(0)}% of ~$30B avg
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/50">
                    HIGH
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

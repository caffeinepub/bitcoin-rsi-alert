import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useKillSwitch } from "../hooks/useQueries";

interface PipelineNode {
  label: string;
  sub?: string;
  active: boolean;
  disabled?: boolean;
  phase2?: boolean;
}

export function PipelineStatusBar() {
  const { data: armed, isLoading } = useKillSwitch();

  const nodes: PipelineNode[] = [
    { label: "TradingView", sub: "Pine Script Alert", active: true },
    { label: "Webhook", sub: "Static Token Auth", active: true },
    {
      label: "Caffeine Backend",
      sub: "Kill Switch · Dedup · Rate Limit",
      active: true,
    },
    { label: "Binance API", sub: "Phase 2", active: false, phase2: true },
  ];

  return (
    <div
      data-ocid="pipeline.status_panel"
      className="rounded-xl border border-border/50 bg-card/60 p-4 backdrop-blur-sm card-glow"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Pipeline state badge */}
        <div className="shrink-0">
          {isLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <motion.div
              key={String(armed)}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs font-bold tracking-widest uppercase ${
                  armed
                    ? "border-[oklch(0.55_0.22_145/0.5)] bg-[oklch(0.55_0.22_145/0.1)] text-[oklch(0.75_0.2_145)]"
                    : "border-destructive/40 bg-destructive/10 text-destructive"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    armed
                      ? "bg-[oklch(0.75_0.2_145)] animate-pulse"
                      : "bg-destructive"
                  }`}
                />
                {armed ? "ARMED" : "DISARMED"}
              </div>
            </motion.div>
          )}
        </div>

        {/* Node flow */}
        <div className="flex flex-1 items-center gap-1 overflow-x-auto pb-1">
          {nodes.map((node, i) => (
            <div key={node.label} className="flex items-center gap-1 shrink-0">
              <NodePill node={node} />
              {i < nodes.length - 1 && (
                <div className="flex items-center gap-0.5 px-0.5">
                  <div className="h-px w-3 bg-border/60" />
                  <svg
                    className="h-2.5 w-2.5 text-muted-foreground/40"
                    fill="currentColor"
                    viewBox="0 0 6 6"
                    aria-hidden="true"
                  >
                    <title>Arrow</title>
                    <path d="M0 0l6 3-6 3V0z" />
                  </svg>
                  <div className="h-px w-3 bg-border/60" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NodePill({ node }: { node: PipelineNode }) {
  return (
    <div
      className={`flex flex-col items-center rounded-lg border px-3 py-2 text-center ${
        node.phase2
          ? "border-border/30 bg-muted/20 opacity-40"
          : node.active
            ? "border-accent/30 bg-accent/5"
            : "border-border/40 bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={`font-mono text-[11px] font-semibold ${
            node.phase2 ? "text-muted-foreground" : "text-foreground"
          }`}
        >
          {node.label}
        </span>
        {node.phase2 && (
          <Badge
            variant="outline"
            className="h-4 px-1 font-mono text-[9px] tracking-widest text-muted-foreground border-border/40"
          >
            PHASE 2
          </Badge>
        )}
      </div>
      {node.sub && (
        <p className="mt-0.5 font-mono text-[9px] text-muted-foreground/60 leading-tight">
          {node.sub}
        </p>
      )}
    </div>
  );
}

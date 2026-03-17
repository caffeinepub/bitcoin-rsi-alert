import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useKillSwitch, useTestnetMode } from "../hooks/useQueries";

function ArrowRight() {
  return (
    <svg
      className="h-3 w-3 text-muted-foreground/40"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <title>Arrow</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

const PIPELINE_STEPS = ["TradingView", "Webhook", "Caffeine", "Binance"];

export function PipelineStatusBar() {
  const { identity } = useInternetIdentity();
  const isAuthed = !!identity;

  const { data: killSwitch, isLoading: ksLoading } = useKillSwitch();
  const { data: testnetMode, isLoading: tmLoading } = useTestnetMode();

  const armed = killSwitch === true;
  const testnet = testnetMode !== false;

  return (
    <div
      className="rounded-lg border border-border/40 bg-card/60 backdrop-blur-sm px-4 py-3"
      data-ocid="pipeline.panel"
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Kill Switch Badge */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Kill Switch
          </span>
          {!isAuthed ? (
            <Badge
              variant="outline"
              className="font-mono text-[10px] border-muted/30 text-muted-foreground"
            >
              —
            </Badge>
          ) : ksLoading ? (
            <Skeleton className="h-5 w-20 rounded-full" />
          ) : armed ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              key="armed"
            >
              <Badge className="font-mono text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                ARMED
              </Badge>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              key="disarmed"
            >
              <Badge className="font-mono text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 px-2.5">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-400 inline-block" />
                DISARMED
              </Badge>
            </motion.div>
          )}
        </div>

        <div className="h-4 w-px bg-border/40" />

        {/* Mode Badge */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Mode
          </span>
          {!isAuthed ? (
            <Badge
              variant="outline"
              className="font-mono text-[10px] border-muted/30 text-muted-foreground"
            >
              —
            </Badge>
          ) : tmLoading ? (
            <Skeleton className="h-5 w-20 rounded-full" />
          ) : testnet ? (
            <Badge className="font-mono text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
              TESTNET
            </Badge>
          ) : (
            <Badge className="font-mono text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              LIVE
            </Badge>
          )}
        </div>

        <div className="h-4 w-px bg-border/40" />

        {/* Pipeline flow */}
        <div className="flex items-center gap-1.5 ml-auto">
          {PIPELINE_STEPS.map((step, i) => (
            <span key={step} className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-muted-foreground/70 tracking-wide">
                {step}
              </span>
              {i < PIPELINE_STEPS.length - 1 && <ArrowRight />}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

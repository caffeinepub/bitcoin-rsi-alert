import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, History, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { AlertRecord } from "../backend.d";

interface AlertHistoryLogProps {
  alerts: AlertRecord[];
  isLoading: boolean;
  onClear: () => void;
  isClearing: boolean;
  compact?: boolean;
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function AlertHistoryLog({
  alerts,
  isLoading,
  onClear,
  isClearing,
  compact = false,
}: AlertHistoryLogProps) {
  return (
    <div className="rounded-xl border border-border bg-card card-glow overflow-hidden h-full">
      <div
        className={`flex items-center justify-between border-b border-border ${
          compact ? "px-3 py-2.5" : "px-5 py-4"
        }`}
      >
        <div className="flex items-center gap-2">
          <History
            className={
              compact ? "h-3.5 w-3.5 text-accent" : "h-4 w-4 text-accent"
            }
          />
          <h3
            className={`font-semibold tracking-wide text-foreground ${
              compact ? "text-xs" : ""
            }`}
          >
            Alert History
          </h3>
          {alerts.length > 0 && (
            <span
              className={`rounded-full bg-accent/20 border border-accent/30 px-1.5 py-0.5 font-mono text-accent ${
                compact ? "text-[10px]" : "text-xs"
              }`}
            >
              {alerts.length}
            </span>
          )}
        </div>
        {alerts.length > 0 && (
          <Button
            data-ocid="history.clear_button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={isClearing}
            className={`gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ${
              compact ? "text-[10px] h-6 px-2" : "text-xs"
            }`}
          >
            <Trash2 className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
            {isClearing ? "Clearing..." : "Clear"}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className={`space-y-2 ${compact ? "p-3" : "p-5"}`}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className={`w-full rounded-lg ${compact ? "h-10" : "h-14"}`}
            />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div
          data-ocid="history.empty_state"
          className={`flex flex-col items-center justify-center gap-2 text-center ${
            compact ? "py-6" : "py-12"
          }`}
        >
          <div
            className={`rounded-full border border-border bg-muted/40 ${
              compact ? "p-2" : "p-4"
            }`}
          >
            <Bell
              className={
                compact
                  ? "h-4 w-4 text-muted-foreground"
                  : "h-6 w-6 text-muted-foreground"
              }
            />
          </div>
          <p
            className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}
          >
            No alignment alerts yet
          </p>
          {!compact && (
            <p className="text-xs text-muted-foreground/60">
              Fires when Price, RSI, and MACD all align bullish or bearish
            </p>
          )}
        </div>
      ) : (
        <ScrollArea className={compact ? "h-48" : "h-72"}>
          <div className={`space-y-1 ${compact ? "p-2" : "p-3 space-y-1.5"}`}>
            <AnimatePresence initial={false}>
              {alerts.map((alert, idx) => (
                <motion.div
                  key={Number(alert.timestamp)}
                  data-ocid={`history.item.${idx + 1}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className={`flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors ${
                    compact ? "px-2.5 py-1.5" : "px-4 py-3"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: alert.rsiValue > 50 ? "#22c55e" : "#ef4444",
                      }}
                    />
                    <div>
                      <p
                        className="font-mono font-bold tracking-wider uppercase"
                        style={{
                          fontSize: compact ? "9px" : "10px",
                          color: alert.rsiValue > 50 ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {alert.rsiValue > 50 ? "BULL" : "BEAR"}
                      </p>
                      <p
                        className={`font-mono text-muted-foreground ${
                          compact ? "text-[9px]" : "text-xs"
                        }`}
                      >
                        {formatTimestamp(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p
                        className={`font-mono text-muted-foreground/70 ${
                          compact ? "text-[9px]" : "text-xs"
                        }`}
                      >
                        RSI
                      </p>
                      <p
                        className={`font-mono font-bold ${
                          compact ? "text-xs" : "text-sm"
                        }`}
                        style={{
                          color: alert.rsiValue > 50 ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {alert.rsiValue.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-mono text-muted-foreground/70 ${
                          compact ? "text-[9px]" : "text-xs"
                        }`}
                      >
                        BTC
                      </p>
                      <p
                        className={`font-mono font-bold text-primary ${
                          compact ? "text-xs" : "text-sm"
                        }`}
                      >
                        {formatPrice(alert.price)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

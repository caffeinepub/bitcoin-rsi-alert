import { AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface OversoldBannerProps {
  visible: boolean;
  rsi: number;
}

export function OversoldBanner({ visible, rsi }: OversoldBannerProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-ocid="alert.panel"
          initial={{ opacity: 0, scaleY: 0.8, y: -10 }}
          animate={{ opacity: 1, scaleY: 1, y: 0 }}
          exit={{ opacity: 0, scaleY: 0.8, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="animate-pulse-glow relative overflow-hidden rounded-xl border border-red-500/40 bg-red-950/30 px-6 py-4"
        >
          {/* Scan-line effect */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/60 to-transparent"
            style={{ animation: "scan-line 3s linear infinite" }}
          />

          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle
                className="h-7 w-7 text-red-400"
                strokeWidth={2.5}
              />
            </div>
            <div className="flex-1">
              <p className="font-mono text-sm font-bold tracking-widest text-red-300 uppercase">
                ⚠ OVERSOLD ALERT
              </p>
              <p className="mt-0.5 text-sm text-red-400/80">
                RSI dropped below 30{" "}
                <span className="font-mono font-bold text-red-300">
                  ({rsi.toFixed(1)})
                </span>
                . Potential buying opportunity — exercise caution.
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-950/60 px-3 py-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="font-mono text-xs font-bold text-red-300 uppercase tracking-wider">
                  LIVE
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

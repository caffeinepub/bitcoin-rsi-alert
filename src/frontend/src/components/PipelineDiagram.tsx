import { BarChart2, Lock, Server, Zap } from "lucide-react";
import { motion } from "motion/react";

const stages = [
  {
    id: "tradingview",
    name: "TradingView",
    subtitle: "Pine Script Alert",
    icon: BarChart2,
    status: "LIVE" as const,
    color: "cyan" as const,
    bullets: [
      "Alert condition written in Pine Script",
      "Fires JSON payload via HTTP POST to webhook URL",
      "Runs 24/7 on TradingView servers — browser not required",
    ],
    security:
      "Pine Script embeds a shared secret string in every alert JSON payload. Never put the secret in the webhook URL — it appears in server logs.",
  },
  {
    id: "webhook",
    name: "Webhook Receiver",
    subtitle: "Caffeine HTTP Endpoint",
    icon: Server,
    status: "STANDBY" as const,
    color: "amber" as const,
    bullets: [
      "Parses and validates the incoming JSON alert",
      "Checks secret, deduplicates, and rate-limits",
      "Logs every alert — executed or rejected",
    ],
    security:
      "Backend checks secret field before any processing. Rejects duplicates using alert_id + 60s TTL. Rate limit: max 1 trade / 5 s.",
  },
  {
    id: "caffeine",
    name: "Caffeine Backend",
    subtitle: "ICP Canister",
    icon: Lock,
    status: "STANDBY" as const,
    color: "violet" as const,
    bullets: [
      "Stores Binance API key/secret in stable memory",
      "Kill switch defaults OFF — must be explicitly enabled",
      "All admin functions require authorization principal",
    ],
    security:
      "Binance API key + secret stored in stable memory, never returned to frontend. Kill switch defaults OFF on every deploy. All admin functions require authorization.",
  },
  {
    id: "binance",
    name: "Binance API",
    subtitle: "Order Execution",
    icon: Zap,
    status: "STANDBY" as const,
    color: "green" as const,
    bullets: [
      "Receives HMAC-SHA256 signed POST order request",
      "API key has Spot Trading only — no withdrawals",
      "ICP HTTP outcalls go through consensus — auditable",
    ],
    security:
      "API key created with Spot Trading only — NO withdrawal permissions. Order signed with HMAC-SHA256(apiSecret, queryString + timestamp). IP-restricted in Binance settings.",
  },
];

const flowLabels = [
  "JSON payload\n+ secret",
  "validated\nalert object",
  "signed HMAC-SHA256\norder request",
];

const colorMap = {
  cyan: {
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/10",
    icon: "text-cyan-400",
    dot: "bg-cyan-400",
    security: "border-cyan-500/20 bg-cyan-500/5",
    glow: "shadow-[0_0_30px_oklch(0.78_0.15_200/0.15)]",
  },
  amber: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    icon: "text-amber-400",
    dot: "bg-amber-400",
    security: "border-amber-500/20 bg-amber-500/5",
    glow: "shadow-[0_0_30px_oklch(0.75_0.18_55/0.12)]",
  },
  violet: {
    border: "border-violet-500/40",
    bg: "bg-violet-500/10",
    icon: "text-violet-400",
    dot: "bg-violet-400",
    security: "border-violet-500/20 bg-violet-500/5",
    glow: "shadow-[0_0_30px_oklch(0.6_0.2_290/0.12)]",
  },
  green: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    icon: "text-emerald-400",
    dot: "bg-emerald-400",
    security: "border-emerald-500/20 bg-emerald-500/5",
    glow: "shadow-[0_0_30px_oklch(0.65_0.18_145/0.12)]",
  },
};

export function PipelineDiagram() {
  return (
    <div
      className="rounded-xl border border-border bg-card p-6"
      style={{ boxShadow: "0 4px 32px oklch(0 0 0 / 0.5)" }}
    >
      <div className="flex flex-col xl:flex-row items-stretch gap-0">
        {stages.map((stage, i) => {
          const c = colorMap[stage.color];
          const Icon = stage.icon;
          return (
            <div
              key={stage.id}
              className="flex flex-col xl:flex-row flex-1 min-w-0"
            >
              {/* Stage card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className={`flex-1 rounded-xl border ${c.border} bg-card ${c.glow} p-4 flex flex-col gap-3`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-lg border ${c.border} ${c.bg} p-2`}
                    >
                      <Icon className={`h-4 w-4 ${c.icon}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {stage.name}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {stage.subtitle}
                      </p>
                    </div>
                  </div>
                  <StatusDot status={stage.status} />
                </div>

                {/* Bullets */}
                <ul className="space-y-1.5">
                  {stage.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <span
                        className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${c.dot}`}
                      />
                      {b}
                    </li>
                  ))}
                </ul>

                {/* Security annotation */}
                <div
                  className={`rounded-lg border ${c.security} px-3 py-2 mt-auto`}
                >
                  <p className="font-mono text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1">
                    🔒 Security
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {stage.security}
                  </p>
                </div>
              </motion.div>

              {/* Arrow connector */}
              {i < stages.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="flex xl:flex-col items-center justify-center px-2 py-3 xl:py-0 xl:px-0 shrink-0"
                >
                  <ArrowConnector label={flowLabels[i]} />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: "LIVE" | "STANDBY" }) {
  const isLive = status === "LIVE";
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          isLive ? "bg-emerald-400 animate-pulse" : "bg-amber-400/70"
        }`}
      />
      <span
        className={`font-mono text-[9px] font-bold tracking-widest ${
          isLive ? "text-emerald-400" : "text-amber-400/80"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

function ArrowConnector({ label }: { label: string }) {
  const lines = label.split("\n");
  return (
    <div className="flex xl:flex-col items-center gap-1 text-center">
      {/* horizontal arrow (xl) */}
      <div className="hidden xl:flex flex-col items-center gap-1">
        <p className="font-mono text-[9px] text-muted-foreground/60 text-center max-w-[80px] leading-tight">
          {lines.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </p>
        <div className="relative flex items-center w-16">
          <div className="flex-1 h-px bg-border" />
          <AnimatedDot />
          <svg
            className="h-3 w-3 text-muted-foreground/60 shrink-0"
            viewBox="0 0 12 12"
            fill="currentColor"
            aria-hidden="true"
          >
            <title>Arrow right</title>
            <path d="M7 1l5 5-5 5V7H0V5h7V1z" />
          </svg>
        </div>
      </div>
      {/* vertical arrow (mobile) */}
      <div className="flex xl:hidden flex-row items-center gap-1">
        <div className="relative flex items-center h-8 flex-col justify-center">
          <div className="w-px flex-1 bg-border" />
          <AnimatedDot />
          <svg
            className="h-3 w-3 text-muted-foreground/60 rotate-90"
            viewBox="0 0 12 12"
            fill="currentColor"
            aria-hidden="true"
          >
            <title>Arrow down</title>
            <path d="M7 1l5 5-5 5V7H0V5h7V1z" />
          </svg>
        </div>
        <p className="font-mono text-[9px] text-muted-foreground/60">
          {lines.join(" · ")}
        </p>
      </div>
    </div>
  );
}

function AnimatedDot() {
  return (
    <motion.span
      className="absolute left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-accent"
      animate={{ x: ["0%", "200%", "200%", "0%"] }}
      transition={{
        duration: 2.5,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    />
  );
}

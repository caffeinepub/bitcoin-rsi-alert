import { Toaster } from "@/components/ui/sonner";
import { motion } from "motion/react";
import { AlertTradeLog } from "./components/AlertTradeLog";
import { CodeReference } from "./components/CodeReference";
import { ConfigPanel } from "./components/ConfigPanel";
import { PipelineDiagram } from "./components/PipelineDiagram";

export default function App() {
  return (
    <div className="min-h-screen bg-background bg-grid relative">
      {/* ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, oklch(0.18 0.06 200 / 0.18) 0%, transparent 65%)",
        }}
      />
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.11 0.018 264)",
            border: "1px solid oklch(0.2 0.025 264)",
            color: "oklch(0.95 0.01 220)",
          },
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-10">
        {/* ── Header ── */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-start gap-4">
            <div className="mt-1 rounded-xl border border-accent/30 bg-accent/10 p-2.5">
              <svg
                className="h-6 w-6 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                role="img"
              >
                <title>Secure pipeline shield</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                TradingView → Webhook → Caffeine → Binance
              </h1>
              <p className="mt-1 text-sm text-muted-foreground font-mono">
                SECURE TRADING PIPELINE · ARCHITECTURE REFERENCE
              </p>
              <p className="mt-2 text-xs text-muted-foreground max-w-2xl leading-relaxed">
                A senior developer’s blueprint for wiring TradingView Pine
                Script alerts through a hardened webhook receiver to automated
                Binance order execution — with every security layer documented.
              </p>
            </div>
          </div>
        </motion.header>

        {/* ── Section 1: Pipeline Diagram ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
          aria-label="Pipeline Diagram"
        >
          <SectionLabel step={1} label="SYSTEM PIPELINE" />
          <PipelineDiagram />
        </motion.section>

        {/* ── Section 2: Configuration Panel ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
          aria-label="Configuration Panel"
        >
          <SectionLabel step={2} label="CONFIGURATION & KILL SWITCH" />
          <ConfigPanel />
        </motion.section>

        {/* ── Section 3: Alert & Trade Logs ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10"
          aria-label="Alert and Trade Logs"
        >
          <SectionLabel step={3} label="ALERT LOG & TRADE LOG" />
          <AlertTradeLog />
        </motion.section>

        {/* ── Section 4: Code Reference ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-10"
          aria-label="Architecture Code Reference"
        >
          <SectionLabel step={4} label="ARCHITECTURE CODE REFERENCE" />
          <CodeReference />
        </motion.section>

        {/* ── Footer ── */}
        <footer className="text-center pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground/50 font-mono">
            © {new Date().getFullYear()}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/70 hover:text-accent transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

function SectionLabel({ step, label }: { step: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20 border border-accent/40 font-mono text-[10px] font-bold text-accent">
        {step}
      </span>
      <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );
}

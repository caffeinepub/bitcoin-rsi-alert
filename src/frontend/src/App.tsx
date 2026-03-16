import { Toaster } from "@/components/ui/sonner";
import { motion } from "motion/react";
import { AdminControlPanel } from "./components/AdminControlPanel";
import { AuditLogTable } from "./components/AuditLogTable";
import { PipelineStatusBar } from "./components/PipelineStatusBar";
import { TestWebhookPanel } from "./components/TestWebhookPanel";

export default function App() {
  return (
    <div className="min-h-screen bg-background bg-grid relative">
      {/* Ambient glow top */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 35% at 50% 0%, oklch(0.18 0.06 200 / 0.15) 0%, transparent 60%)",
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

      <div className="relative mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-2">
              <svg
                className="h-5 w-5 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>Shield icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight text-foreground">
                Trading Pipeline Admin
              </h1>
              <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                TradingView → Webhook → Caffeine → Binance · Phase 1
              </p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[10px] text-accent tracking-widest uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                Live
              </span>
            </div>
          </div>
        </motion.header>

        {/* Pipeline Status Bar */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-6"
          aria-label="Pipeline Status"
        >
          <PipelineStatusBar />
        </motion.section>

        {/* Admin Control Panel */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
          aria-label="Admin Control Panel"
        >
          <AdminControlPanel />
        </motion.section>

        {/* Audit Log Table */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-6"
          aria-label="Audit Log"
        >
          <AuditLogTable />
        </motion.section>

        {/* Test Webhook Panel */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
          aria-label="Test Webhook"
        >
          <TestWebhookPanel />
        </motion.section>

        {/* Footer */}
        <footer className="border-t border-border/30 pt-4 text-center">
          <p className="font-mono text-[11px] text-muted-foreground/50">
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

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, Lock, LogOut, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { AdminControlPanel } from "./components/AdminControlPanel";
import { AuditLogTable } from "./components/AuditLogTable";
import { PipelineStatusBar } from "./components/PipelineStatusBar";
import { TestWebhookPanel } from "./components/TestWebhookPanel";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export default function App() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";
  const principal = identity?.getPrincipal().toString();
  const truncatedPrincipal = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-3)}`
    : "";

  return (
    <div className="min-h-screen bg-background bg-grid relative">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 35% at 50% 0%, oklch(0.18 0.06 200 / 0.12) 0%, transparent 60%)",
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

      <div className="relative mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-accent/25 bg-accent/8 p-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
                Trading Pipeline Admin
              </h1>
              <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                TradingView → Webhook → Caffeine → Binance
              </p>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {/* Auth */}
              {isInitializing || isLoggingIn ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="border-accent/30 bg-accent/5 text-accent/50 font-mono text-xs"
                  data-ocid="auth.button"
                >
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  {isLoggingIn ? "Signing in…" : "Loading"}
                </Button>
              ) : identity ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline font-mono text-[10px] text-muted-foreground border border-border/40 rounded px-2 py-1 bg-muted/20">
                    {truncatedPrincipal}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clear}
                    className="border-accent/20 bg-accent/5 hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive text-accent font-mono text-xs transition-colors"
                    data-ocid="auth.button"
                  >
                    <LogOut className="mr-1.5 h-3 w-3" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={login}
                  className="border-accent/40 bg-accent/10 hover:bg-accent/20 text-accent font-mono text-xs transition-colors"
                  data-ocid="auth.button"
                >
                  <Lock className="mr-1.5 h-3 w-3" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </motion.header>

        {/* Pipeline Status Bar */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mb-4"
          aria-label="Pipeline Status"
        >
          <PipelineStatusBar />
        </motion.section>

        {/* Admin Control Panel */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mb-4"
          aria-label="Admin Controls"
        >
          <AdminControlPanel />
        </motion.section>

        {/* Audit Log */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="mb-4"
          aria-label="Audit Log"
        >
          <AuditLogTable />
        </motion.section>

        {/* Test Webhook */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="mb-8"
          aria-label="Test Webhook"
        >
          <TestWebhookPanel />
        </motion.section>

        {/* Footer */}
        <footer className="border-t border-border/20 pt-4 text-center">
          <p className="font-mono text-[11px] text-muted-foreground/40">
            © {new Date().getFullYear()} · Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

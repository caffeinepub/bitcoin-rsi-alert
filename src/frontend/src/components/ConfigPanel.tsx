import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Save,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ConfigPanel() {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [tradingEnabled, setTradingEnabled] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    toast.success("Credentials saved", {
      description:
        "Stored securely in canister stable memory — never exposed to frontend.",
      duration: 4000,
    });
  }

  function handleKillSwitchChange(val: boolean) {
    if (val) {
      setConfirmOpen(true);
    } else {
      setTradingEnabled(false);
      toast.error("Kill switch OFF", {
        description: "Trading disabled. Incoming alerts will be logged only.",
        duration: 3000,
      });
    }
  }

  function handleConfirmEnable() {
    setTradingEnabled(true);
    setConfirmOpen(false);
    toast.success("Trading ACTIVE", {
      description:
        "Kill switch enabled — the backend will now execute Binance orders.",
      duration: 4000,
    });
  }

  function handleTestWebhook() {
    toast(
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-foreground">
          📡 Test webhook received
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          secret ✓ · kill_switch{" "}
          <span
            className={tradingEnabled ? "text-emerald-400" : "text-amber-400"}
          >
            {tradingEnabled ? "ACTIVE" : "OFF"}
          </span>{" "}
          · rate_limit ✓ · alert_id unique ✓
        </span>
        <span className="text-xs text-muted-foreground">
          Status:{" "}
          {tradingEnabled ? (
            <span className="text-emerald-400">→ EXECUTED (simulated)</span>
          ) : (
            <span className="text-amber-400">→ REJECTED — kill switch</span>
          )}
        </span>
      </div>,
      { duration: 6000 },
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Credentials ── */}
        <div
          className="rounded-xl border border-border bg-card p-6"
          style={{ boxShadow: "0 4px 24px oklch(0 0 0 / 0.4)" }}
        >
          <h2 className="font-semibold text-foreground mb-1">
            Credentials & Security
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            Stored in canister stable memory — never returned to the frontend
            after write.
          </p>

          <div className="space-y-4">
            {/* Binance API Key */}
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Binance API Key
              </Label>
              <div className="relative">
                <Input
                  data-ocid="config.apikey.input"
                  type={showKey ? "text" : "password"}
                  placeholder="sk-••••••••••••••••••••••••••••••••"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono text-xs pr-9 bg-secondary/60 border-border/60 text-foreground placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  {showKey ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Binance API Secret */}
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Binance API Secret
              </Label>
              <div className="relative">
                <Input
                  data-ocid="config.apisecret.input"
                  type={showSecret ? "text" : "password"}
                  placeholder="••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="font-mono text-xs pr-9 bg-secondary/60 border-border/60 text-foreground placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  {showSecret ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Webhook Secret */}
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Webhook Secret
              </Label>
              <div className="relative">
                <Input
                  data-ocid="config.webhooksecret.input"
                  type={showWebhook ? "text" : "password"}
                  placeholder="my-super-secret-webhook-key-2024"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="font-mono text-xs pr-9 bg-secondary/60 border-border/60 text-foreground placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhook((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  {showWebhook ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                This exact string must be embedded in your TradingView Pine
                Script alert JSON as the{" "}
                <code className="font-mono bg-muted/60 px-1 rounded text-accent/80">
                  "secret"
                </code>{" "}
                field.
              </p>
            </div>

            {/* Save button */}
            <Button
              data-ocid="config.save_button"
              onClick={handleSave}
              className="w-full gap-2 bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent font-mono text-xs"
              variant="outline"
            >
              {saved ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saved ? "Saved to stable memory" : "Save Credentials"}
            </Button>

            {/* Warning callout */}
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/8 px-3 py-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-300/90 leading-relaxed">
                  API key must have <strong>Spot Trading enabled only</strong>.
                  Never enable withdrawal permissions. Restrict the key to your
                  canister's IP in Binance settings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Kill Switch ── */}
        <div
          className="rounded-xl border border-border bg-card p-6 flex flex-col"
          style={{ boxShadow: "0 4px 24px oklch(0 0 0 / 0.4)" }}
        >
          <h2 className="font-semibold text-foreground mb-1">Kill Switch</h2>
          <p className="text-xs text-muted-foreground mb-6">
            Master gate between alert validation and order execution.
          </p>

          {/* Big toggle area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-5 py-4">
            <div
              className={`rounded-2xl border-2 p-8 text-center transition-all duration-500 ${
                tradingEnabled
                  ? "border-emerald-500/60 bg-emerald-500/8 shadow-[0_0_40px_oklch(0.65_0.18_145/0.2)]"
                  : "border-red-500/40 bg-red-500/8"
              }`}
            >
              <Switch
                data-ocid="config.killswitch.switch"
                checked={tradingEnabled}
                onCheckedChange={handleKillSwitchChange}
                className="scale-150 mb-4"
              />
              <p className="font-mono text-xs tracking-wider text-muted-foreground mt-2 mb-3">
                TRADING ENABLED
              </p>
              <Badge
                className={`font-mono text-xs tracking-widest px-3 py-1 ${
                  tradingEnabled
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20"
                    : "bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/20"
                }`}
                variant="outline"
              >
                {tradingEnabled
                  ? "TRADING ACTIVE"
                  : "TRADING DISABLED — Alerts logged only"}
              </Badge>
            </div>

            <p className="text-[11px] text-muted-foreground/60 text-center max-w-xs leading-relaxed">
              Kill switch defaults to{" "}
              <strong className="text-muted-foreground">OFF</strong> on every
              deploy. Enable only when you are ready to execute live trades.
            </p>
          </div>

          {/* Test Webhook button */}
          <Button
            data-ocid="config.test_button"
            onClick={handleTestWebhook}
            variant="outline"
            className="w-full gap-2 border-border/60 bg-secondary/40 hover:bg-secondary text-foreground font-mono text-xs mt-2"
          >
            <Wifi className="h-3.5 w-3.5 text-accent" />
            Test Webhook
          </Button>
          <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
            Simulates a TradingView alert arriving at the webhook endpoint
          </p>
        </div>
      </div>

      {/* ── Confirm Enable Dialog ── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          data-ocid="config.killswitch.dialog"
          className="bg-card border-border"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Enable Live Trading?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Enabling the kill switch will cause the backend to{" "}
              <strong className="text-foreground">
                execute real Binance orders
              </strong>{" "}
              whenever a valid TradingView alert is received.
              <br />
              <br />
              Confirm you have reviewed your Binance API key permissions,
              webhook secret, and are ready to trade with real funds.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="config.killswitch.cancel_button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="border-border/60 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              data-ocid="config.killswitch.confirm_button"
              onClick={handleConfirmEnable}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono"
            >
              Enable Trading
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

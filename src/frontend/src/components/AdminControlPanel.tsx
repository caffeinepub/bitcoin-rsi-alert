import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useClearBinanceCredentials,
  useDefaultOrderQuantity,
  useHasBinanceCredentials,
  useHasWebhookSecret,
  useIsAdmin,
  useKillSwitch,
  useSetBinanceCredentials,
  useSetDefaultOrderQuantity,
  useSetKillSwitch,
  useSetTestnetMode,
  useSetWebhookSecret,
  useTestnetMode,
} from "../hooks/useQueries";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StorageBadge({ stored }: { stored: boolean | undefined }) {
  if (stored === undefined)
    return (
      <Badge
        variant="outline"
        className="font-mono text-[10px] border-muted/30 text-muted-foreground"
      >
        Checking...
      </Badge>
    );
  return stored ? (
    <Badge className="font-mono text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
      <CheckCircle2 className="mr-1 h-3 w-3" />
      Stored
    </Badge>
  ) : (
    <Badge className="font-mono text-[10px] bg-muted/30 text-muted-foreground border border-border/40">
      <XCircle className="mr-1 h-3 w-3" />
      Not Set
    </Badge>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-4">
      {children}
    </h3>
  );
}

function NotAuthedPlaceholder() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground/50 py-8 justify-center">
      <Lock className="h-4 w-4" />
      <span className="font-mono text-xs">
        Sign in to access admin controls
      </span>
    </div>
  );
}

// ─── Kill Switch Section ──────────────────────────────────────────────────────

function KillSwitchSection() {
  const { data: killSwitch, isLoading } = useKillSwitch();
  const setKillSwitch = useSetKillSwitch();
  const [pendingState, setPendingState] = useState<boolean | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const armed = killSwitch === true;

  function handleToggleRequest(next: boolean) {
    setPendingState(next);
    setDialogOpen(true);
  }

  async function handleConfirm() {
    if (pendingState === null) return;
    setDialogOpen(false);
    try {
      await setKillSwitch.mutateAsync(pendingState);
      toast.success(
        pendingState
          ? "Kill switch armed — trading enabled"
          : "Kill switch disarmed — trading disabled",
      );
    } catch {
      toast.error("Failed to update kill switch");
    } finally {
      setPendingState(null);
    }
  }

  return (
    <>
      <SectionHeading>Kill Switch</SectionHeading>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : armed ? (
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-red-400" />
          )}
          <div>
            <p className="text-sm font-medium">
              {isLoading
                ? "Loading..."
                : armed
                  ? "Trading Armed"
                  : "Trading Disarmed"}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">
              {armed
                ? "System will process and execute trade alerts"
                : "All trade execution is blocked"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {armed ? (
            <Badge className="font-mono text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              ARMED
            </Badge>
          ) : (
            <Badge className="font-mono text-[10px] bg-red-500/15 text-red-400 border border-red-500/30">
              DISARMED
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading || setKillSwitch.isPending}
            onClick={() => handleToggleRequest(!armed)}
            className="font-mono text-xs border-border/60 hover:border-accent/40"
            data-ocid="killswitch.toggle"
          >
            {setKillSwitch.isPending ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : null}
            {armed ? "Disarm" : "Arm"}
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="bg-card border-border/60"
          data-ocid="killswitch.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-mono">
              {pendingState ? "Arm Kill Switch" : "Disarm Kill Switch"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {pendingState
                ? "This will enable trade execution. Alerts from TradingView will be processed and orders placed on Binance."
                : "This will disable all trade execution. No orders will be placed until re-armed."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="font-mono text-xs"
              data-ocid="killswitch.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={setKillSwitch.isPending}
              className={`font-mono text-xs ${
                pendingState
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              }`}
              data-ocid="killswitch.confirm_button"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Webhook Configuration ────────────────────────────────────────────────────

function WebhookConfigSection() {
  const { data: hasSecret } = useHasWebhookSecret();
  const setWebhookSecret = useSetWebhookSecret();
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const webhookUrl = `${window.location.origin}/webhook`;

  async function handleSave() {
    if (!secret.trim()) {
      toast.error("Secret token cannot be empty");
      return;
    }
    if (secret.length < 32) {
      toast.error("Secret token should be at least 32 characters");
      return;
    }
    try {
      await setWebhookSecret.mutateAsync(secret);
      setSecret("");
      toast.success("Webhook secret saved");
    } catch {
      toast.error("Failed to save webhook secret");
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied");
  }

  return (
    <>
      <SectionHeading>Webhook Configuration</SectionHeading>

      {/* Endpoint URL */}
      <div className="mb-4">
        <Label className="font-mono text-[11px] text-muted-foreground mb-1.5 block">
          Webhook Endpoint URL
        </Label>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded border border-border/40 bg-muted/20 px-3 py-2 font-mono text-[11px] text-accent truncate">
            {webhookUrl}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="shrink-0 border-border/60 hover:border-accent/40 font-mono text-xs"
            data-ocid="webhook.copy_button"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground/60">
          Paste this URL in your TradingView alert webhook field.
        </p>
      </div>

      {/* Secret Token */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label className="font-mono text-[11px] text-muted-foreground">
            Secret Token
          </Label>
          <StorageBadge stored={hasSecret} />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type={showSecret ? "text" : "password"}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter 32+ character secret token…"
              className="font-mono text-xs pr-9 bg-muted/20 border-border/40 focus:border-accent/40"
              data-ocid="webhook.input"
            />
            <button
              type="button"
              onClick={() => setShowSecret((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground"
              aria-label={showSecret ? "Hide" : "Show"}
            >
              {showSecret ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={setWebhookSecret.isPending || !secret.trim()}
            className="shrink-0 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 font-mono text-xs"
            data-ocid="webhook.save_button"
          >
            {setWebhookSecret.isPending ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : null}
            Save
          </Button>
        </div>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground/60">
          Write-only. Tokens are stored securely and never returned to the
          frontend.
        </p>
      </div>
    </>
  );
}

// ─── Binance Credentials ──────────────────────────────────────────────────────

function BinanceCredentialsSection() {
  const { data: hasCreds } = useHasBinanceCredentials();
  const setCreds = useSetBinanceCredentials();
  const clearCreds = useClearBinanceCredentials();
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  async function handleSave() {
    if (!apiKey.trim() || !apiSecret.trim()) {
      toast.error("Both API Key and Secret are required");
      return;
    }
    try {
      await setCreds.mutateAsync({
        apiKey: apiKey.trim(),
        apiSecret: apiSecret.trim(),
      });
      setApiKey("");
      setApiSecret("");
      toast.success("Binance credentials saved");
    } catch {
      toast.error("Failed to save credentials");
    }
  }

  async function handleClear() {
    setClearDialogOpen(false);
    try {
      await clearCreds.mutateAsync();
      toast.success("Binance credentials cleared");
    } catch {
      toast.error("Failed to clear credentials");
    }
  }

  return (
    <>
      <SectionHeading>Binance Credentials</SectionHeading>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="font-mono text-[11px] text-muted-foreground">
          Spot-only sub-account · No withdrawals
        </p>
        <StorageBadge stored={hasCreds} />
      </div>

      <div className="space-y-3">
        <div>
          <Label className="font-mono text-[11px] text-muted-foreground mb-1.5 block">
            API Key
          </Label>
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Binance API Key…"
              className="font-mono text-xs pr-9 bg-muted/20 border-border/40 focus:border-accent/40"
              data-ocid="binance.input"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground"
              aria-label={showKey ? "Hide" : "Show"}
            >
              {showKey ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <Label className="font-mono text-[11px] text-muted-foreground mb-1.5 block">
            API Secret
          </Label>
          <div className="relative">
            <Input
              type={showApiSecret ? "text" : "password"}
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Binance API Secret…"
              className="font-mono text-xs pr-9 bg-muted/20 border-border/40 focus:border-accent/40"
              data-ocid="binance.textarea"
            />
            <button
              type="button"
              onClick={() => setShowApiSecret((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground"
              aria-label={showApiSecret ? "Hide" : "Show"}
            >
              {showApiSecret ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={setCreds.isPending || !apiKey.trim() || !apiSecret.trim()}
            className="bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 font-mono text-xs"
            data-ocid="binance.save_button"
          >
            {setCreds.isPending ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : null}
            Save Credentials
          </Button>
          {hasCreds && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setClearDialogOpen(true)}
              disabled={clearCreds.isPending}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-mono text-xs"
              data-ocid="binance.delete_button"
            >
              Clear
            </Button>
          )}
        </div>
        <p className="font-mono text-[10px] text-muted-foreground/60">
          Keys are stored as opaque blobs in canister stable memory. Never
          returned to the frontend.
        </p>
      </div>

      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent
          className="bg-card border-border/60"
          data-ocid="binance.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-mono">
              Clear Binance Credentials?
            </DialogTitle>
            <DialogDescription>
              This will permanently remove the stored API key and secret. You
              will need to re-enter them to resume trading.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClearDialogOpen(false)}
              className="font-mono text-xs"
              data-ocid="binance.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClear}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-mono text-xs"
              data-ocid="binance.confirm_button"
            >
              Clear Credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Trading Configuration ────────────────────────────────────────────────────

function TradingConfigSection() {
  const { data: testnetMode, isLoading: tmLoading } = useTestnetMode();
  const setTestnetMode = useSetTestnetMode();
  const { data: orderQty } = useDefaultOrderQuantity();
  const setOrderQty = useSetDefaultOrderQuantity();
  const [qty, setQty] = useState("");
  const [liveDialogOpen, setLiveDialogOpen] = useState(false);

  const isTestnet = testnetMode !== false;

  function handleTestnetToggle(checked: boolean) {
    if (!checked) {
      // switching to LIVE — show warning
      setLiveDialogOpen(true);
    } else {
      // switching to TESTNET — safe, no confirm needed
      setTestnetMode
        .mutateAsync(true)
        .then(() => {
          toast.success("Switched to Testnet mode");
        })
        .catch(() => {
          toast.error("Failed to update mode");
        });
    }
  }

  async function handleConfirmLive() {
    setLiveDialogOpen(false);
    try {
      await setTestnetMode.mutateAsync(false);
      toast.success("Switched to Live trading mode");
    } catch {
      toast.error("Failed to update mode");
    }
  }

  async function handleSaveQty() {
    const val = qty.trim() || orderQty || "";
    if (!val) {
      toast.error("Enter a valid order quantity");
      return;
    }
    try {
      await setOrderQty.mutateAsync(val);
      setQty("");
      toast.success("Default order quantity saved");
    } catch {
      toast.error("Failed to save order quantity");
    }
  }

  return (
    <>
      <SectionHeading>Trading Configuration</SectionHeading>

      {/* Testnet Toggle */}
      <div className="flex items-center justify-between mb-5 p-3 rounded-lg border border-border/30 bg-muted/10">
        <div>
          <p className="text-sm font-medium">
            {isTestnet ? (
              <span className="text-amber-400">Testnet Mode</span>
            ) : (
              <span className="text-emerald-400">Live Trading Mode</span>
            )}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {isTestnet
              ? "Orders routed to Binance testnet — no real funds"
              : "⚠ Live mode — real funds will be traded"}
          </p>
        </div>
        <Switch
          checked={isTestnet}
          onCheckedChange={handleTestnetToggle}
          disabled={tmLoading || setTestnetMode.isPending}
          data-ocid="trading.switch"
          className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-emerald-600"
        />
      </div>

      {/* Order Quantity */}
      <div>
        <Label className="font-mono text-[11px] text-muted-foreground mb-1.5 block">
          Default Order Quantity
          {orderQty && (
            <span className="ml-2 text-accent">Current: {orderQty}</span>
          )}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder={orderQty || "e.g. 0.001"}
            className="font-mono text-xs bg-muted/20 border-border/40 focus:border-accent/40"
            data-ocid="trading.input"
          />
          <Button
            size="sm"
            onClick={handleSaveQty}
            disabled={setOrderQty.isPending}
            className="shrink-0 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 font-mono text-xs"
            data-ocid="trading.save_button"
          >
            {setOrderQty.isPending ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : null}
            Save
          </Button>
        </div>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground/60">
          BTC quantity per trade (e.g. 0.001 = ~$60 at $60k BTC).
        </p>
      </div>

      <Dialog open={liveDialogOpen} onOpenChange={setLiveDialogOpen}>
        <DialogContent
          className="bg-card border-border/60"
          data-ocid="trading.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-mono text-amber-400">
              Switch to Live Trading?
            </DialogTitle>
            <DialogDescription>
              <strong>This uses real funds.</strong> Orders will be placed on
              the live Binance exchange. Ensure you have tested the pipeline on
              testnet and the kill switch is configured correctly.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLiveDialogOpen(false)}
              className="font-mono text-xs"
              data-ocid="trading.cancel_button"
            >
              Stay on Testnet
            </Button>
            <Button
              onClick={handleConfirmLive}
              className="bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs"
              data-ocid="trading.confirm_button"
            >
              Switch to Live
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Admin Control Panel ──────────────────────────────────────────────────────

export function AdminControlPanel() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  if (!identity) {
    return (
      <Card className="border-border/40 bg-card/60" data-ocid="admin.panel">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm text-muted-foreground">
            Admin Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotAuthedPlaceholder />
        </CardContent>
      </Card>
    );
  }

  if (adminLoading) {
    return (
      <Card className="border-border/40 bg-card/60" data-ocid="admin.panel">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm">
            Admin Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground/50">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-mono text-xs">Verifying admin access…</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="border-border/40 bg-card/60" data-ocid="admin.panel">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-sm">
            Admin Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground/50">
            <Lock className="h-4 w-4" />
            <span className="font-mono text-xs">Admin access required</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 bg-card/60" data-ocid="admin.panel">
      <CardHeader className="pb-4">
        <CardTitle className="font-mono text-sm flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" />
          Admin Control Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {/* Kill Switch */}
        <div className="pb-6">
          <KillSwitchSection />
        </div>
        <Separator className="bg-border/30" />

        {/* Webhook Config */}
        <div className="py-6">
          <WebhookConfigSection />
        </div>
        <Separator className="bg-border/30" />

        {/* Binance Credentials */}
        <div className="py-6">
          <BinanceCredentialsSection />
        </div>
        <Separator className="bg-border/30" />

        {/* Trading Config */}
        <div className="pt-6">
          <TradingConfigSection />
        </div>
      </CardContent>
    </Card>
  );
}

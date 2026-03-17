import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  CheckCircle2,
  Key,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useClearBinanceCredentials,
  useHasBinanceCredentials,
  useIsAdmin,
  useKillSwitch,
  useSetBinanceCredentials,
  useSetKillSwitch,
  useSetTestnetMode,
  useSetWebhookSecret,
  useTestnetMode,
} from "../hooks/useQueries";

export function AdminControlPanel() {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  if (isAdminLoading) {
    return (
      <Card className="border-border/50 bg-card/60 card-glow backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="border-destructive/20 bg-card/60 card-glow backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">
              Admin Access Required
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in with your admin identity to manage pipeline controls
            </p>
          </div>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            variant="outline"
            className="border-accent/40 text-accent hover:bg-accent/10"
          >
            {isLoggingIn ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            {isLoggingIn ? "Connecting..." : "Sign In"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <AdminPanelContent />;
}

function AdminPanelContent() {
  const { data: armed, isLoading: killLoading } = useKillSwitch();
  const setKillSwitch = useSetKillSwitch();
  const setWebhookSecret = useSetWebhookSecret();

  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleKillSwitchToggle = async (newValue: boolean) => {
    if (newValue) {
      setConfirmOpen(true);
      return;
    }
    try {
      await setKillSwitch.mutateAsync(false);
      toast.success("Pipeline DISARMED — trading disabled");
    } catch {
      toast.error("Failed to update kill switch");
    }
  };

  const handleConfirmArm = async () => {
    setConfirmOpen(false);
    try {
      await setKillSwitch.mutateAsync(true);
      toast.success("Pipeline ARMED — trading enabled");
    } catch {
      toast.error("Failed to arm pipeline");
    }
  };

  const handleSaveSecret = async () => {
    if (!secret.trim()) {
      toast.error("Secret cannot be empty");
      return;
    }
    try {
      await setWebhookSecret.mutateAsync(secret.trim());
      setSecret("");
      toast.success("Webhook secret saved");
    } catch {
      toast.error("Failed to save webhook secret");
    }
  };

  return (
    <Card className="border-border/50 bg-card/60 card-glow backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-accent" />
          Admin Control Panel
        </CardTitle>
        <CardDescription className="font-mono text-[11px]">
          Pipeline controls · Admin only
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Row 1: Kill Switch + Webhook Secret */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kill Switch */}
          <div
            className="rounded-xl border p-5 transition-all"
            style={{
              borderColor: armed
                ? "oklch(0.55 0.22 145 / 0.4)"
                : "oklch(0.55 0.22 25 / 0.4)",
              background: armed
                ? "oklch(0.55 0.22 145 / 0.05)"
                : "oklch(0.55 0.22 25 / 0.05)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {armed ? (
                    <ShieldCheck className="h-4 w-4 text-[oklch(0.75_0.2_145)]" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-destructive" />
                  )}
                  <span
                    className="font-mono text-xs font-bold tracking-widest uppercase"
                    style={{
                      color: armed
                        ? "oklch(0.75 0.2 145)"
                        : "oklch(0.7 0.22 25)",
                    }}
                  >
                    {armed ? "ARMED" : "DISARMED"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {armed
                    ? "Trading is ENABLED. Validated webhooks will trigger Binance orders."
                    : "Trading is DISABLED. All webhook alerts will be logged but not executed."}
                </p>
              </div>
              <div className="shrink-0">
                {killLoading ? (
                  <Skeleton className="h-6 w-11" />
                ) : (
                  <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogTrigger asChild>
                      <motion.div whileTap={{ scale: 0.97 }}>
                        <Switch
                          data-ocid="killswitch.toggle"
                          checked={!!armed}
                          onCheckedChange={handleKillSwitchToggle}
                          disabled={setKillSwitch.isPending}
                          className="data-[state=checked]:bg-[oklch(0.55_0.22_145)] data-[state=unchecked]:bg-destructive/60"
                        />
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="border-border/50 bg-card">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <ShieldAlert className="h-5 w-5 text-[oklch(0.75_0.2_145)]" />
                          Arm the Pipeline?
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-relaxed">
                          You are about to <strong>enable live trading</strong>.
                          Validated TradingView webhook alerts will trigger real
                          Binance orders. Ensure testnet mode has been verified
                          before proceeding.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setConfirmOpen(false)}
                          data-ocid="killswitch.cancel_button"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleConfirmArm}
                          disabled={setKillSwitch.isPending}
                          data-ocid="killswitch.confirm_button"
                          className="bg-[oklch(0.55_0.22_145)] hover:bg-[oklch(0.5_0.22_145)] text-white"
                        >
                          {setKillSwitch.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Confirm — Arm Pipeline
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>

          {/* Webhook Secret */}
          <div className="rounded-xl border border-border/40 bg-muted/10 p-5">
            <div className="mb-3">
              <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                Webhook Secret Token
              </Label>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                Embedded in TradingView payload for validation. Never exposed to
                frontend after save.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  data-ocid="webhook.secret.input"
                  type={showSecret ? "text" : "password"}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter new secret token"
                  className="bg-background/50 border-border/60 font-mono text-sm pr-9"
                  onKeyDown={(e) => e.key === "Enter" && handleSaveSecret()}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  aria-label={showSecret ? "Hide secret" : "Show secret"}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <title>{showSecret ? "Hide" : "Show"}</title>
                    {showSecret ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    )}
                  </svg>
                </button>
              </div>
              <Button
                data-ocid="webhook.secret.save_button"
                onClick={handleSaveSecret}
                disabled={setWebhookSecret.isPending || !secret.trim()}
                size="sm"
                className="shrink-0"
              >
                {setWebhookSecret.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Row 2: Binance Credentials + Testnet Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BinanceCredentialsSection />
          <TestnetModeSection />
        </div>
      </CardContent>
    </Card>
  );
}

function BinanceCredentialsSection() {
  const { data: hasCredentials, isLoading: credLoading } =
    useHasBinanceCredentials();
  const setCredentials = useSetBinanceCredentials();
  const clearCredentials = useClearBinanceCredentials();

  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const handleSaveCredentials = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      toast.error("Both API Key and API Secret are required");
      return;
    }
    try {
      await setCredentials.mutateAsync({
        apiKey: apiKey.trim(),
        apiSecret: apiSecret.trim(),
      });
      setApiKey("");
      setApiSecret("");
      toast.success("Binance credentials saved securely");
    } catch {
      toast.error("Failed to save credentials");
    }
  };

  const handleClearCredentials = async () => {
    setClearConfirmOpen(false);
    try {
      await clearCredentials.mutateAsync();
      toast.success("Binance credentials cleared");
    } catch {
      toast.error("Failed to clear credentials");
    }
  };

  return (
    <div className="rounded-xl border border-border/40 bg-muted/10 p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Key className="h-3.5 w-3.5 text-muted-foreground" />
            <Label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
              Binance API Credentials
            </Label>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Stored as opaque blob — never exposed to frontend.
          </p>
        </div>
        {credLoading ? (
          <Skeleton className="h-5 w-28" />
        ) : hasCredentials ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.55_0.22_145_/_0.4)] bg-[oklch(0.55_0.22_145_/_0.1)] px-2 py-0.5 font-mono text-[10px] text-[oklch(0.75_0.2_145)] tracking-widest uppercase shrink-0">
            <CheckCircle2 className="h-3 w-3" />
            Stored
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 font-mono text-[10px] text-destructive tracking-widest uppercase shrink-0">
            <XCircle className="h-3 w-3" />
            Not set
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Input
          data-ocid="binance.credentials.apikey.input"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="API Key"
          className="bg-background/50 border-border/60 font-mono text-sm"
          autoComplete="off"
        />
        <Input
          data-ocid="binance.credentials.apisecret.input"
          type="password"
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
          placeholder="API Secret"
          className="bg-background/50 border-border/60 font-mono text-sm"
          autoComplete="off"
          onKeyDown={(e) => e.key === "Enter" && handleSaveCredentials()}
        />
        <div className="flex gap-2 pt-1">
          <Button
            data-ocid="binance.credentials.save_button"
            onClick={handleSaveCredentials}
            disabled={
              setCredentials.isPending || !apiKey.trim() || !apiSecret.trim()
            }
            size="sm"
            className="flex-1"
          >
            {setCredentials.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {setCredentials.isPending ? "Saving..." : "Save Credentials"}
          </Button>
          {hasCredentials && (
            <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
              <DialogTrigger asChild>
                <Button
                  data-ocid="binance.credentials.clear_button"
                  variant="outline"
                  size="sm"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 shrink-0"
                >
                  Clear
                </Button>
              </DialogTrigger>
              <DialogContent className="border-border/50 bg-card">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    Clear Binance Credentials?
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed">
                    This will permanently remove the stored API key and secret.
                    Trading will be disabled until new credentials are saved.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setClearConfirmOpen(false)}
                    data-ocid="binance.credentials.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleClearCredentials}
                    disabled={clearCredentials.isPending}
                    data-ocid="binance.credentials.confirm_button"
                  >
                    {clearCredentials.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Clear Credentials
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}

function TestnetModeSection() {
  const { data: testnetMode, isLoading: testnetLoading } = useTestnetMode();
  const setTestnetMode = useSetTestnetMode();
  const [liveConfirmOpen, setLiveConfirmOpen] = useState(false);

  const handleToggle = (newValue: boolean) => {
    if (!newValue) {
      // Switching to LIVE — requires confirmation
      setLiveConfirmOpen(true);
      return;
    }
    // Switching back to testnet — immediate
    handleSetMode(true);
  };

  const handleSetMode = async (mode: boolean) => {
    try {
      await setTestnetMode.mutateAsync(mode);
      toast.success(
        mode ? "Switched to TESTNET mode" : "Switched to LIVE TRADING mode",
      );
    } catch {
      toast.error("Failed to update trading mode");
    }
  };

  const handleConfirmLive = async () => {
    setLiveConfirmOpen(false);
    await handleSetMode(false);
  };

  const isTestnet = testnetMode !== false; // default to testnet if undefined

  return (
    <div
      className="rounded-xl border p-5 transition-all"
      style={{
        borderColor: isTestnet
          ? "oklch(0.6 0.18 200 / 0.4)"
          : "oklch(0.7 0.18 60 / 0.4)",
        background: isTestnet
          ? "oklch(0.6 0.18 200 / 0.05)"
          : "oklch(0.7 0.18 60 / 0.05)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isTestnet ? (
              <ShieldCheck
                className="h-4 w-4"
                style={{ color: "oklch(0.72 0.17 200)" }}
              />
            ) : (
              <AlertTriangle
                className="h-4 w-4"
                style={{ color: "oklch(0.78 0.18 60)" }}
              />
            )}
            <span
              className="font-mono text-xs font-bold tracking-widest uppercase"
              style={{
                color: isTestnet
                  ? "oklch(0.72 0.17 200)"
                  : "oklch(0.78 0.18 60)",
              }}
            >
              {isTestnet ? "TESTNET" : "LIVE TRADING"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isTestnet
              ? "Safe mode — orders go to Binance testnet. No real funds at risk."
              : "⚠ REAL MODE — orders execute against live Binance account with real funds."}
          </p>
        </div>
        <div className="shrink-0">
          {testnetLoading ? (
            <Skeleton className="h-6 w-11" />
          ) : (
            <Dialog open={liveConfirmOpen} onOpenChange={setLiveConfirmOpen}>
              <DialogTrigger asChild>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Switch
                    data-ocid="testnet.mode.toggle"
                    checked={!!isTestnet}
                    onCheckedChange={handleToggle}
                    disabled={setTestnetMode.isPending}
                    className="data-[state=checked]:bg-[oklch(0.55_0.18_200)] data-[state=unchecked]:bg-[oklch(0.55_0.18_60)]"
                  />
                </motion.div>
              </DialogTrigger>
              <DialogContent className="border-border/50 bg-card">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle
                      className="h-5 w-5"
                      style={{ color: "oklch(0.78 0.18 60)" }}
                    />
                    Enable Live Trading?
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed">
                    You are switching from <strong>Testnet</strong> to{" "}
                    <strong>Live Trading</strong>. Orders will execute against
                    your real Binance account using real funds. Only proceed if
                    you have verified the full pipeline on testnet.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setLiveConfirmOpen(false)}
                    data-ocid="testnet.mode.cancel_button"
                  >
                    Stay on Testnet
                  </Button>
                  <Button
                    onClick={handleConfirmLive}
                    disabled={setTestnetMode.isPending}
                    data-ocid="testnet.mode.confirm_button"
                    style={{
                      background: "oklch(0.55 0.18 60)",
                    }}
                    className="text-white hover:opacity-90"
                  >
                    {setTestnetMode.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Enable Live Trading
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}

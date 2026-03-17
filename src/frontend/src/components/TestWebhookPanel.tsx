import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlaskConical, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useReceiveWebhook } from "../hooks/useQueries";

function generateAlertId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const PINE_SCRIPT_EXAMPLE = `{
  "alert_id": "{{timenow}}",
  "symbol": "BTCUSDT",
  "side": "BUY",
  "signal": "long_entry",
  "token": "YOUR_SECRET_TOKEN"
}`;

export function TestWebhookPanel() {
  const [alertId, setAlertId] = useState(generateAlertId);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [side, setSide] = useState("BUY");
  const [signal, setSignal] = useState("test_signal");
  const [secretToken, setSecretToken] = useState("");
  const [response, setResponse] = useState<string | null>(null);

  const sendWebhook = useReceiveWebhook();

  async function handleSend() {
    if (!secretToken.trim()) {
      toast.error("Secret token is required to test the webhook");
      return;
    }
    setResponse(null);
    try {
      const result = await sendWebhook.mutateAsync({
        alertId,
        timestamp: new Date().toISOString(),
        symbol: symbol.trim().toUpperCase(),
        side,
        signal: signal.trim() || "test_signal",
        secretToken: secretToken.trim(),
      });
      setResponse(result);
      setAlertId(generateAlertId());
      toast.success("Webhook test sent");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setResponse(`Error: ${msg}`);
      toast.error("Webhook test failed");
    }
  }

  const isAccepted =
    response?.toLowerCase().includes("accepted") ||
    response?.toLowerCase().includes("ok") ||
    response?.toLowerCase().includes("success");
  const isRejected = response !== null && !isAccepted;

  return (
    <Card className="border-border/40 bg-card/60" data-ocid="testwebhook.panel">
      <CardHeader className="pb-4">
        <CardTitle className="font-mono text-sm flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-accent" />
          Test Webhook
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-mono text-[11px] text-muted-foreground mb-1.5 block">
                  Alert ID
                </Label>
                <Input
                  value={alertId}
                  onChange={(e) => setAlertId(e.target.value)}
                  className="font-mono text-[11px] bg-muted/20 border-border/40 focus:border-accent/40"
                  data-ocid="testwebhook.input"
                />
              </div>
              <div>
                <Label className="font-mono text-[11px] text-muted-foreground mb-1.5 block">
                  Symbol
                </Label>
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="BTCUSDT"
                  className="font-mono text-xs bg-muted/20 border-border/40 focus:border-accent/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-mono text-[11px] text-muted-foreground mb-1.5 block">
                  Side
                </Label>
                <Select value={side} onValueChange={setSide}>
                  <SelectTrigger
                    className="font-mono text-xs bg-muted/20 border-border/40 focus:border-accent/40"
                    data-ocid="testwebhook.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/60">
                    <SelectItem value="BUY" className="font-mono text-xs">
                      BUY
                    </SelectItem>
                    <SelectItem value="SELL" className="font-mono text-xs">
                      SELL
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-mono text-[11px] text-muted-foreground mb-1.5 block">
                  Signal
                </Label>
                <Input
                  value={signal}
                  onChange={(e) => setSignal(e.target.value)}
                  placeholder="long_entry"
                  className="font-mono text-xs bg-muted/20 border-border/40 focus:border-accent/40"
                />
              </div>
            </div>

            <div>
              <Label className="font-mono text-[11px] text-muted-foreground mb-1.5 block">
                Secret Token
              </Label>
              <Input
                type="password"
                value={secretToken}
                onChange={(e) => setSecretToken(e.target.value)}
                placeholder="Your webhook secret token…"
                className="font-mono text-xs bg-muted/20 border-border/40 focus:border-accent/40"
                data-ocid="testwebhook.textarea"
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={sendWebhook.isPending}
              className="w-full bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 font-mono text-xs"
              data-ocid="testwebhook.submit_button"
            >
              {sendWebhook.isPending ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="mr-2 h-3.5 w-3.5" />
              )}
              Send Test Webhook
            </Button>

            {/* Response */}
            {response !== null && (
              <div
                className={`rounded-lg border p-3 ${
                  isAccepted
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : isRejected
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-border/40 bg-muted/10"
                }`}
                data-ocid={
                  isAccepted
                    ? "testwebhook.success_state"
                    : "testwebhook.error_state"
                }
              >
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Badge
                    className={`font-mono text-[9px] ${
                      isAccepted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {isAccepted ? "RESPONSE" : "ERROR"}
                  </Badge>
                </div>
                <pre className="font-mono text-[11px] text-foreground/80 whitespace-pre-wrap break-all">
                  {response}
                </pre>
              </div>
            )}
          </div>

          {/* Pine Script Example */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
              TradingView Pine Script Alert Body
            </p>
            <div className="rounded-lg border border-border/30 bg-muted/10 p-4">
              <pre className="font-mono text-[11px] text-accent/90 leading-relaxed whitespace-pre">
                {PINE_SCRIPT_EXAMPLE}
              </pre>
            </div>
            <div className="mt-3 space-y-1.5">
              <p className="font-mono text-[11px] text-muted-foreground/70">
                Paste this JSON as the{" "}
                <span className="text-accent">Message Body</span> in your
                TradingView alert.
              </p>
              <p className="font-mono text-[11px] text-muted-foreground/70">
                The <span className="text-accent">token</span> field must match
                your configured webhook secret exactly.
              </p>
              <p className="font-mono text-[11px] text-muted-foreground/70">
                <span className="text-accent">{"{{timenow}}"}</span> is a
                TradingView variable that auto-generates a unique alert ID per
                bar.
              </p>
              <div className="mt-3 rounded border border-border/30 bg-muted/20 p-2.5">
                <p className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">
                  Webhook URL
                </p>
                <code className="font-mono text-[10px] text-accent/80 break-all">
                  {window.location.origin}/webhook
                </code>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

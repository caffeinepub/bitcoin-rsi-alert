import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, FlaskConical, Loader2 } from "lucide-react";
import { useState } from "react";
import { useReceiveWebhook } from "../hooks/useQueries";

export function TestWebhookPanel() {
  const [open, setOpen] = useState(false);
  const [alertId, setAlertId] = useState(() => `test-${Date.now()}`);
  const [timestamp, setTimestamp] = useState(() => new Date().toISOString());
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [side, setSide] = useState("BUY");
  const [signal, setSignal] = useState("RSI_OVERSOLD_MACD_CROSS");
  const [secretToken, setSecretToken] = useState("");
  const [response, setResponse] = useState<string | null>(null);

  const receiveWebhook = useReceiveWebhook();
  const qc = useQueryClient();

  const handleSubmit = async () => {
    setResponse(null);
    try {
      const result = await receiveWebhook.mutateAsync({
        alertId,
        timestamp,
        symbol,
        side,
        signal,
        secretToken,
      });
      setResponse(result);
      qc.invalidateQueries({ queryKey: ["auditLog"] });
      // Reset alert ID for next test
      setAlertId(`test-${Date.now()}`);
      setTimestamp(new Date().toISOString());
    } catch (err) {
      setResponse(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card
        data-ocid="testwebhook.panel"
        className="border-border/40 bg-card/40 backdrop-blur-sm"
        style={{
          boxShadow:
            "0 0 0 1px oklch(0.2 0.025 264), 0 4px 24px oklch(0 0 0 / 0.4)",
        }}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none hover:bg-muted/10 rounded-t-xl transition-colors pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Test Webhook
                </CardTitle>
                <span className="font-mono text-[10px] border border-border/40 rounded px-1.5 py-0.5 text-muted-foreground/60 tracking-widest uppercase">
                  Dev Only
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground/50 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>
            <CardDescription className="font-mono text-[11px]">
              Send a test webhook alert directly to the backend canister
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="space-y-1.5">
                <Label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                  Alert ID
                </Label>
                <Input
                  value={alertId}
                  onChange={(e) => setAlertId(e.target.value)}
                  className="font-mono text-xs bg-background/50 border-border/60"
                  placeholder="test-123456"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                  Timestamp (ISO)
                </Label>
                <Input
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="font-mono text-xs bg-background/50 border-border/60"
                  placeholder="2026-01-01T00:00:00.000Z"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                  Symbol
                </Label>
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="font-mono text-xs bg-background/50 border-border/60"
                  placeholder="BTCUSDT"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                  Side
                </Label>
                <Select value={side} onValueChange={setSide}>
                  <SelectTrigger className="font-mono text-xs bg-background/50 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY" className="font-mono text-xs">
                      BUY
                    </SelectItem>
                    <SelectItem value="SELL" className="font-mono text-xs">
                      SELL
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                  Signal
                </Label>
                <Input
                  value={signal}
                  onChange={(e) => setSignal(e.target.value)}
                  className="font-mono text-xs bg-background/50 border-border/60"
                  placeholder="RSI_OVERSOLD_MACD_CROSS"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                  Secret Token
                </Label>
                <Input
                  type="password"
                  value={secretToken}
                  onChange={(e) => setSecretToken(e.target.value)}
                  className="font-mono text-xs bg-background/50 border-border/60"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button
                data-ocid="testwebhook.submit_button"
                onClick={handleSubmit}
                disabled={receiveWebhook.isPending}
                variant="outline"
                className="border-accent/30 text-accent hover:bg-accent/10"
              >
                {receiveWebhook.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FlaskConical className="mr-2 h-4 w-4" />
                )}
                Send Test Webhook
              </Button>

              {response !== null && (
                <div
                  className={`flex-1 rounded-lg border px-3 py-2 font-mono text-xs ${
                    response.startsWith("Error")
                      ? "border-destructive/40 bg-destructive/5 text-destructive"
                      : "border-[oklch(0.55_0.22_145/0.4)] bg-[oklch(0.55_0.22_145/0.05)] text-[oklch(0.75_0.2_145)]"
                  }`}
                >
                  <span className="opacity-50">→ </span>
                  {response}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

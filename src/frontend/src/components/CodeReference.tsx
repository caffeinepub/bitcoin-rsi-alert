import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckSquare, Square } from "lucide-react";

const pineScriptJson = `{
  "alert_id": "{{timenow}}-BTCUSDT",
  "secret": "YOUR_WEBHOOK_SECRET_HERE",
  "symbol": "BTCUSDT",
  "side": "BUY",
  "quantity": "0.001",
  "price": "{{close}}",
  "timeframe": "{{interval}}"
}`;

const validationFlow = `1.  Parse incoming JSON payload
2.  CHECK: payload.secret === storedWebhookSecret  → reject if mismatch  (401)
3.  CHECK: killSwitch === true                      → reject if false     (503, log only)
4.  CHECK: seenAlertIds.contains(alert_id)          → reject if duplicate (409)
5.  CHECK: now - lastTradeTime < 5 seconds          → reject if rate lim. (429)
6.  Add alert_id to seen set with 60s TTL
7.  Log alert as VALIDATED
8.  Forward to Binance execution layer`;

const binanceSigning = `// Build query string
params = "symbol=BTCUSDT&side=BUY&type=MARKET&quantity=0.001&timestamp=" + now()

// Sign with HMAC-SHA256
signature = HMAC_SHA256(key = apiSecret, data = params)

// POST request
POST https://api.binance.com/api/v3/order
Headers: { "X-MBX-APIKEY": apiKey }
Body:    params + "&signature=" + signature`;

const permissions = [
  { label: "Enable Reading", required: true, enabled: true, danger: false },
  {
    label: "Enable Spot & Margin Trading",
    required: true,
    enabled: true,
    danger: false,
  },
  { label: "Enable Futures", required: false, enabled: false, danger: false },
  {
    label: "Enable Withdrawals",
    required: false,
    enabled: false,
    danger: true,
  },
  {
    label: "Enable Internal Transfer",
    required: false,
    enabled: false,
    danger: false,
  },
];

const windowDotColors = [
  "bg-red-500/60",
  "bg-amber-500/60",
  "bg-emerald-500/60",
];

export function CodeReference() {
  return (
    <Accordion
      type="multiple"
      defaultValue={["pine-script", "webhook-validation"]}
      className="rounded-xl border border-border bg-card overflow-hidden"
      style={{ boxShadow: "0 4px 24px oklch(0 0 0 / 0.4)" }}
    >
      {/* Panel 1 */}
      <AccordionItem
        value="pine-script"
        className="border-border/50"
        data-ocid="coderef.pine_script.panel"
      >
        <AccordionTrigger
          data-ocid="coderef.pine_script.toggle"
          className="px-5 py-4 font-mono text-xs tracking-widest text-muted-foreground uppercase hover:text-foreground hover:no-underline"
        >
          <span className="flex items-center gap-2">
            <span className="h-5 w-5 rounded border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center text-[9px] font-bold text-cyan-400">
              1
            </span>
            TradingView Pine Script — Alert JSON Structure
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-5">
          <CodeBlock code={pineScriptJson} lang="json" />
          <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="text-cyan-300 font-mono">{"{{timenow}}"}</span>{" "}
              is a TradingView built-in variable that resolves to the exact UTC
              timestamp of the bar that triggered the alert — making{" "}
              <span className="font-mono text-cyan-300">alert_id</span> unique
              per alert. The{" "}
              <span className="font-mono text-cyan-300">secret</span> field is
              validated server-side before any action.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Panel 2 */}
      <AccordionItem
        value="webhook-validation"
        className="border-border/50"
        data-ocid="coderef.webhook.panel"
      >
        <AccordionTrigger
          data-ocid="coderef.webhook.toggle"
          className="px-5 py-4 font-mono text-xs tracking-widest text-muted-foreground uppercase hover:text-foreground hover:no-underline"
        >
          <span className="flex items-center gap-2">
            <span className="h-5 w-5 rounded border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-[9px] font-bold text-amber-400">
              2
            </span>
            Webhook Receiver — Security Validation Flow
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-5">
          <CodeBlock code={validationFlow} lang="text" />
          <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Each check is independent — all 5 must pass before an order is
              placed. Steps 3–5 are logged regardless of outcome so you have a
              full audit trail. The 60s TTL on the seen-set handles
              TradingView’s occasional duplicate delivery behaviour.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Panel 3 */}
      <AccordionItem
        value="hmac-signing"
        className="border-border/50"
        data-ocid="coderef.hmac.panel"
      >
        <AccordionTrigger
          data-ocid="coderef.hmac.toggle"
          className="px-5 py-4 font-mono text-xs tracking-widest text-muted-foreground uppercase hover:text-foreground hover:no-underline"
        >
          <span className="flex items-center gap-2">
            <span className="h-5 w-5 rounded border border-violet-500/40 bg-violet-500/10 flex items-center justify-center text-[9px] font-bold text-violet-400">
              3
            </span>
            Binance Order Signing — HMAC-SHA256
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-5">
          <CodeBlock code={binanceSigning} lang="js" />
          <div className="mt-3 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              On ICP,{" "}
              <strong className="text-foreground">
                HTTP outcalls go through consensus
              </strong>{" "}
              — the canister’s Binance API calls are auditable on-chain. The{" "}
              <span className="font-mono text-violet-300">timestamp</span> must
              be within ±1000ms of Binance server time; sync via{" "}
              <span className="font-mono text-violet-300">/api/v3/time</span> if
              needed. The API secret never leaves stable memory.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Panel 4 */}
      <AccordionItem
        value="api-permissions"
        className="border-0"
        data-ocid="coderef.permissions.panel"
      >
        <AccordionTrigger
          data-ocid="coderef.permissions.toggle"
          className="px-5 py-4 font-mono text-xs tracking-widest text-muted-foreground uppercase hover:text-foreground hover:no-underline"
        >
          <span className="flex items-center gap-2">
            <span className="h-5 w-5 rounded border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-[9px] font-bold text-emerald-400">
              4
            </span>
            API Key Permissions — Binance Setup
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-5 pb-5">
          <div className="rounded-lg border border-border/60 bg-secondary/30 p-4 space-y-3">
            {permissions.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                {p.enabled ? (
                  <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square
                    className={`h-4 w-4 shrink-0 ${p.danger ? "text-red-400" : "text-muted-foreground/40"}`}
                  />
                )}
                <span
                  className={`font-mono text-xs ${
                    p.enabled
                      ? "text-foreground"
                      : p.danger
                        ? "text-red-400/80"
                        : "text-muted-foreground/60"
                  }`}
                >
                  {p.label}
                </span>
                {p.required && (
                  <span className="font-mono text-[9px] text-emerald-400/70 border border-emerald-500/30 bg-emerald-500/5 px-1.5 py-0.5 rounded">
                    required
                  </span>
                )}
                {p.danger && (
                  <span className="font-mono text-[9px] text-red-400 border border-red-500/30 bg-red-500/5 px-1.5 py-0.5 rounded">
                    NEVER enable
                  </span>
                )}
                {!p.required && !p.danger && (
                  <span className="font-mono text-[9px] text-muted-foreground/40 border border-border/30 px-1.5 py-0.5 rounded">
                    not needed
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">
                Restrict the API key to your canister’s IP address
              </strong>{" "}
              in Binance → API Management settings. This limits blast radius if
              the key is ever compromised — an attacker with the key still
              cannot use it from another IP.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="relative rounded-lg border border-border/60 bg-[oklch(0.07_0.012_264)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
        <span className="font-mono text-[9px] tracking-widest text-muted-foreground/50 uppercase">
          {lang}
        </span>
        <div className="flex gap-1.5">
          {windowDotColors.map((c) => (
            <span key={c} className={`h-2 w-2 rounded-full ${c}`} />
          ))}
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-[11px] leading-relaxed">
        <code className="font-mono text-foreground/85 whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}

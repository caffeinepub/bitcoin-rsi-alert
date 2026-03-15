import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AlertStatus =
  | "EXECUTED"
  | "REJECTED - duplicate"
  | "REJECTED - kill switch"
  | "REJECTED - bad secret"
  | "REJECTED - rate limit";

interface AlertEntry {
  time: string;
  alertId: string;
  symbol: string;
  side: "BUY" | "SELL";
  status: AlertStatus;
}

interface TradeEntry {
  time: string;
  symbol: string;
  side: "BUY" | "SELL";
  qty: string;
  binanceResponse: string;
  result: "SUCCESS" | "ERROR";
}

const mockAlerts: AlertEntry[] = [
  {
    time: "14:32:07",
    alertId: "1741960327-BTCUSDT",
    symbol: "BTCUSDT",
    side: "BUY",
    status: "EXECUTED",
  },
  {
    time: "14:32:09",
    alertId: "1741960329-BTCUSDT",
    symbol: "BTCUSDT",
    side: "BUY",
    status: "REJECTED - duplicate",
  },
  {
    time: "14:18:44",
    alertId: "1741959524-BTCUSDT",
    symbol: "BTCUSDT",
    side: "SELL",
    status: "EXECUTED",
  },
  {
    time: "13:55:12",
    alertId: "1741958112-ETHUSDT",
    symbol: "ETHUSDT",
    side: "BUY",
    status: "REJECTED - kill switch",
  },
  {
    time: "13:41:03",
    alertId: "1741957263-BTCUSDT",
    symbol: "BTCUSDT",
    side: "SELL",
    status: "REJECTED - bad secret",
  },
  {
    time: "13:30:58",
    alertId: "1741956658-BTCUSDT",
    symbol: "BTCUSDT",
    side: "BUY",
    status: "EXECUTED",
  },
  {
    time: "13:30:59",
    alertId: "1741956659-BTCUSDT",
    symbol: "BTCUSDT",
    side: "BUY",
    status: "REJECTED - rate limit",
  },
  {
    time: "13:01:22",
    alertId: "1741954882-ETHUSDT",
    symbol: "ETHUSDT",
    side: "SELL",
    status: "EXECUTED",
  },
];

const mockTrades: TradeEntry[] = [
  {
    time: "14:32:07",
    symbol: "BTCUSDT",
    side: "BUY",
    qty: "0.001",
    binanceResponse: "orderId: 28391740",
    result: "SUCCESS",
  },
  {
    time: "13:30:58",
    symbol: "BTCUSDT",
    side: "BUY",
    qty: "0.001",
    binanceResponse: "orderId: 28391601",
    result: "SUCCESS",
  },
  {
    time: "13:01:22",
    symbol: "ETHUSDT",
    side: "SELL",
    qty: "0.05",
    binanceResponse: "orderId: 28391488",
    result: "SUCCESS",
  },
  {
    time: "12:14:55",
    symbol: "BTCUSDT",
    side: "BUY",
    qty: "0.001",
    binanceResponse: "ERR: -1021 TIMESTAMP",
    result: "ERROR",
  },
  {
    time: "11:58:34",
    symbol: "BTCUSDT",
    side: "SELL",
    qty: "0.001",
    binanceResponse: "orderId: 28391100",
    result: "SUCCESS",
  },
];

const alertStatusStyle: Record<AlertStatus, string> = {
  EXECUTED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  "REJECTED - duplicate": "bg-red-500/15 text-red-300 border-red-500/40",
  "REJECTED - kill switch":
    "bg-amber-500/15 text-amber-300 border-amber-500/40",
  "REJECTED - bad secret": "bg-red-500/15 text-red-300 border-red-500/40",
  "REJECTED - rate limit":
    "bg-orange-500/15 text-orange-300 border-orange-500/40",
};

export function AlertTradeLog() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Alert Log ── */}
      <div
        className="rounded-xl border border-border bg-card overflow-hidden"
        style={{ boxShadow: "0 4px 24px oklch(0 0 0 / 0.4)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-semibold text-foreground">
              Incoming Webhook Alerts
            </h3>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/60">
            {mockAlerts.length} entries
          </span>
        </div>
        <div className="overflow-auto" data-ocid="alerts.table">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase w-20">
                  Time
                </TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase">
                  Alert ID
                </TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase w-24">
                  Symbol
                </TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase w-14">
                  Side
                </TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAlerts.map((row, i) => (
                <TableRow
                  key={row.alertId}
                  data-ocid={`alerts.item.${i + 1}`}
                  className="border-border/30 hover:bg-secondary/30 transition-colors"
                >
                  <TableCell className="font-mono text-[11px] text-muted-foreground py-2">
                    {row.time}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground/70 py-2 max-w-[100px] truncate">
                    {row.alertId.slice(-12)}…
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-foreground/80 py-2">
                    {row.symbol}
                  </TableCell>
                  <TableCell className="py-2">
                    <span
                      className={`font-mono text-[10px] font-bold ${row.side === "BUY" ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {row.side}
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge
                      variant="outline"
                      className={`font-mono text-[9px] tracking-wider px-1.5 py-0 ${alertStatusStyle[row.status]}`}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Trade Log ── */}
      <div
        className="rounded-xl border border-border bg-card overflow-hidden"
        style={{ boxShadow: "0 4px 24px oklch(0 0 0 / 0.4)" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">
            Binance Order Execution Log
          </h3>
          <span className="font-mono text-[10px] text-muted-foreground/60">
            {mockTrades.length} orders
          </span>
        </div>
        <div className="overflow-auto" data-ocid="trades.table">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase w-20">
                  Time
                </TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase w-24">
                  Symbol
                </TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase w-14">
                  Side
                </TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase w-16">
                  Qty
                </TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase">
                  Binance Response
                </TableHead>
                <TableHead className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase w-20">
                  Result
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTrades.map((row, i) => (
                <TableRow
                  key={`${row.time}-${row.symbol}-${row.side}`}
                  data-ocid={`trades.item.${i + 1}`}
                  className="border-border/30 hover:bg-secondary/30 transition-colors"
                >
                  <TableCell className="font-mono text-[11px] text-muted-foreground py-2">
                    {row.time}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-foreground/80 py-2">
                    {row.symbol}
                  </TableCell>
                  <TableCell className="py-2">
                    <span
                      className={`font-mono text-[10px] font-bold ${row.side === "BUY" ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {row.side}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground/70 py-2">
                    {row.qty}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground/70 py-2 max-w-[140px] truncate">
                    {row.binanceResponse}
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge
                      variant="outline"
                      className={`font-mono text-[9px] tracking-wider px-1.5 py-0 ${
                        row.result === "SUCCESS"
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                          : "bg-red-500/15 text-red-300 border-red-500/40"
                      }`}
                    >
                      {row.result}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

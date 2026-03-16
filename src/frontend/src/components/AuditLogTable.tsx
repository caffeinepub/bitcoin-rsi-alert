import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList, RefreshCw } from "lucide-react";
import type { AuditLogEntry } from "../backend.d";
import { useAuditLog } from "../hooks/useQueries";

function formatTime(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  const d = new Date(ms);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function truncate(str: string, max = 12): string {
  if (str.length <= max) return str;
  return `${str.slice(0, 6)}…${str.slice(-4)}`;
}

function StatusBadge({ status }: { status: string }) {
  const isAccepted = status === "accepted";
  return (
    <Badge
      className={`font-mono text-[10px] tracking-widest uppercase ${
        isAccepted
          ? "bg-[oklch(0.55_0.22_145/0.15)] text-[oklch(0.75_0.2_145)] border-[oklch(0.55_0.22_145/0.4)] hover:bg-[oklch(0.55_0.22_145/0.2)]"
          : "bg-destructive/10 text-destructive border-destructive/40 hover:bg-destructive/15"
      }`}
      variant="outline"
    >
      {isAccepted ? "✓ accepted" : "✗ rejected"}
    </Badge>
  );
}

function SideBadge({ side }: { side: string }) {
  const isBuy = side.toUpperCase() === "BUY";
  return (
    <span
      className={`inline-block font-mono text-[11px] font-bold ${
        isBuy ? "text-[oklch(0.75_0.2_145)]" : "text-destructive"
      }`}
    >
      {side.toUpperCase()}
    </span>
  );
}

function LogRow({ entry, index }: { entry: AuditLogEntry; index: number }) {
  const ocid = `auditlog.item.${index}` as const;
  return (
    <TableRow
      data-ocid={ocid}
      className="border-border/30 hover:bg-muted/20 transition-colors"
    >
      <TableCell className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
        {formatTime(entry.receivedAt)}
      </TableCell>
      <TableCell>
        <span
          className="font-mono text-[11px] text-foreground/70 tracking-wide cursor-default"
          title={entry.alertId}
        >
          {truncate(entry.alertId)}
        </span>
      </TableCell>
      <TableCell>
        <span className="font-mono text-xs font-semibold text-accent">
          {entry.symbol}
        </span>
      </TableCell>
      <TableCell>
        <SideBadge side={entry.side} />
      </TableCell>
      <TableCell className="font-mono text-[11px] text-muted-foreground max-w-[120px] truncate">
        {entry.signal}
      </TableCell>
      <TableCell>
        <StatusBadge status={entry.status} />
      </TableCell>
      <TableCell className="font-mono text-[11px] text-muted-foreground/70 max-w-[160px] truncate">
        {entry.reason || "—"}
      </TableCell>
    </TableRow>
  );
}

export function AuditLogTable() {
  const { data: entries, isLoading, isFetching } = useAuditLog();

  return (
    <Card className="border-border/50 bg-card/60 card-glow backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-accent" />
            <CardTitle className="text-sm font-semibold">Audit Log</CardTitle>
            {isFetching && !isLoading && (
              <RefreshCw className="h-3 w-3 text-muted-foreground animate-spin" />
            )}
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/50 tracking-widest uppercase">
            Auto-refresh 5s
          </span>
        </div>
        <CardDescription className="font-mono text-[11px]">
          All incoming webhook alerts · most recent first
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div
            data-ocid="auditlog.loading_state"
            className="flex flex-col gap-2 p-4"
          >
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !entries || entries.length === 0 ? (
          <div
            data-ocid="auditlog.empty_state"
            className="flex flex-col items-center justify-center py-16 gap-3"
          >
            <div className="rounded-xl border border-border/30 bg-muted/10 p-3">
              <ClipboardList className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No webhook alerts received yet
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                Use the Test Webhook panel below to send a test alert
              </p>
            </div>
          </div>
        ) : (
          <div data-ocid="auditlog.table" className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60 w-[160px]">
                    Time
                  </TableHead>
                  <TableHead className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60">
                    Alert ID
                  </TableHead>
                  <TableHead className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60">
                    Symbol
                  </TableHead>
                  <TableHead className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60">
                    Side
                  </TableHead>
                  <TableHead className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60">
                    Signal
                  </TableHead>
                  <TableHead className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60">
                    Status
                  </TableHead>
                  <TableHead className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60">
                    Reason
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, i) => (
                  <LogRow key={entry.alertId} entry={entry} index={i + 1} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

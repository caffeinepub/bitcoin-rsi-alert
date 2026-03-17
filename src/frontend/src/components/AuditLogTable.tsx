import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardList, Loader2, Lock } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAuditLog } from "../hooks/useQueries";

function formatTime(receivedAt: bigint): string {
  const ms = Number(receivedAt / 1_000_000n);
  const d = new Date(ms);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function truncate(s: string, len = 12): string {
  if (s.length <= len) return s;
  return `${s.slice(0, len)}…`;
}

function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  const isAccepted =
    lower === "accepted" || lower === "ok" || lower === "success";
  const isRejected =
    lower === "rejected" || lower === "error" || lower === "failed";

  if (isAccepted) {
    return (
      <Badge className="font-mono text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        {status}
      </Badge>
    );
  }
  if (isRejected) {
    return (
      <Badge className="font-mono text-[10px] bg-red-500/15 text-red-400 border border-red-500/30">
        {status}
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="font-mono text-[10px] border-border/40 text-muted-foreground"
    >
      {status}
    </Badge>
  );
}

function SideBadge({ side }: { side: string }) {
  const isBuy = side.toUpperCase() === "BUY";
  return (
    <Badge
      className={`font-mono text-[10px] ${
        isBuy
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-red-500/10 text-red-400 border border-red-500/20"
      }`}
    >
      {side.toUpperCase()}
    </Badge>
  );
}

export function AuditLogTable() {
  const { identity } = useInternetIdentity();
  const { data: log, isLoading } = useAuditLog();

  return (
    <Card className="border-border/40 bg-card/60" data-ocid="auditlog.table">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-sm flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-accent" />
            Audit Log
          </CardTitle>
          {isLoading && identity && (
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/60">
              <Loader2 className="h-3 w-3 animate-spin" />
              Polling every 5s
            </span>
          )}
          {!isLoading && identity && (
            <span className="font-mono text-[10px] text-muted-foreground/60">
              {log?.length ?? 0} entries · auto-refreshes every 5s
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!identity ? (
          <div
            className="flex items-center gap-2 py-12 justify-center text-muted-foreground/50"
            data-ocid="auditlog.empty_state"
          >
            <Lock className="h-4 w-4" />
            <span className="font-mono text-xs">Sign in to view audit log</span>
          </div>
        ) : isLoading ? (
          <div
            className="flex items-center gap-2 py-12 justify-center text-muted-foreground/50"
            data-ocid="auditlog.loading_state"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-mono text-xs">Loading audit log…</span>
          </div>
        ) : !log || log.length === 0 ? (
          <div
            className="flex flex-col items-center gap-2 py-12 text-muted-foreground/50"
            data-ocid="auditlog.empty_state"
          >
            <ClipboardList className="h-8 w-8 opacity-30" />
            <span className="font-mono text-xs">No alerts received yet</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 w-24">
                    Time
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Alert ID
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Symbol
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Side
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Signal
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Status
                  </TableHead>
                  <TableHead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    Reason
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {log.map((entry, i) => (
                  <TableRow
                    key={`${entry.alertId}-${i}`}
                    className="border-border/20 hover:bg-muted/10 transition-colors"
                    data-ocid={`auditlog.item.${i + 1}`}
                  >
                    <TableCell className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatTime(entry.receivedAt)}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground/70">
                      {truncate(entry.alertId, 14)}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] font-medium text-foreground">
                      {entry.symbol}
                    </TableCell>
                    <TableCell>
                      <SideBadge side={entry.side} />
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground/70">
                      {truncate(entry.signal, 16)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={entry.status} />
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground/70 max-w-[200px] truncate">
                      {entry.reason || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

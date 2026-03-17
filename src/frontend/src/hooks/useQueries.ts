import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuditLogEntry } from "../backend.d";
import { useActor } from "./useActor";

export type Timeframe = "1m" | "1h" | "1D" | "1w";

export interface ChartDataPoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  rsi: number | null;
  macd: number | null;
  signal: number | null;
  histogram: number | null;
  sma20: number | null;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

export function useAuditLog() {
  const { actor, isFetching } = useActor();
  return useQuery<AuditLogEntry[]>({
    queryKey: ["auditLog"],
    queryFn: async () => {
      if (!actor) return [];
      const log = await actor.getAuditLog();
      return [...log].reverse();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

// ─── Kill Switch ──────────────────────────────────────────────────────────────

export function useKillSwitch() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["killSwitch"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.getKillSwitchStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useSetKillSwitch() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (status: boolean) => {
      if (!actor) throw new Error("Not connected");
      await actor.setKillSwitch(status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["killSwitch"] });
    },
  });
}

// ─── Webhook Secret ───────────────────────────────────────────────────────────

export function useSetWebhookSecret() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (secret: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.setWebhookSecret(secret);
    },
  });
}

// ─── Admin Check ─────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Test Webhook ─────────────────────────────────────────────────────────────

export function useReceiveWebhook() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: {
      alertId: string;
      timestamp: string;
      symbol: string;
      side: string;
      signal: string;
      secretToken: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.receiveWebhook(
        params.alertId,
        params.timestamp,
        params.symbol,
        params.side,
        params.signal,
        params.secretToken,
      );
    },
  });
}

// ─── Binance Credentials ─────────────────────────────────────────────────────

export function useHasBinanceCredentials() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["hasBinanceCredentials"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasBinanceCredentials();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useSetBinanceCredentials() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { apiKey: string; apiSecret: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.setBinanceCredentials(params.apiKey, params.apiSecret);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hasBinanceCredentials"] });
    },
  });
}

export function useClearBinanceCredentials() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      await actor.clearBinanceCredentials();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hasBinanceCredentials"] });
    },
  });
}

// ─── Testnet Mode ─────────────────────────────────────────────────────────────

export function useTestnetMode() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["testnetMode"],
    queryFn: async () => {
      if (!actor) return true;
      return actor.getTestnetMode();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useSetTestnetMode() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mode: boolean) => {
      if (!actor) throw new Error("Not connected");
      await actor.setTestnetMode(mode);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testnetMode"] });
    },
  });
}

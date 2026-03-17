import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuditLogEntry, backendInterface } from "../backend.d";
import { useActor } from "./useActor";

// ─── Factory helpers ───────────────────────────────────────────────────────────

function useBackendQuery<T>(
  key: string,
  fetcher: (actor: backendInterface) => Promise<T>,
  fallback: T,
  interval?: number,
) {
  const { actor, isFetching } = useActor();
  return useQuery<T>({
    queryKey: [key],
    queryFn: async () => (!actor ? fallback : fetcher(actor)),
    enabled: !!actor && !isFetching,
    ...(interval !== undefined ? { refetchInterval: interval } : {}),
  });
}

function useBackendMutation<TArg = void>(
  mutFn: (actor: backendInterface, arg: TArg) => Promise<void>,
  invalidateKey: string,
) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (arg: TArg) => {
      if (!actor) throw new Error("Not connected");
      await mutFn(actor, arg);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [invalidateKey] }),
  });
}

// ─── Query hooks ──────────────────────────────────────────────────────────────

export function useAuditLog() {
  const { actor, isFetching } = useActor();
  return useQuery<AuditLogEntry[]>({
    queryKey: ["auditLog"],
    queryFn: async () => {
      if (!actor) return [];
      return [...(await actor.getAuditLog())].reverse();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export const useKillSwitch = () =>
  useBackendQuery("killSwitch", (a) => a.getKillSwitchStatus(), false, 10000);
export const useHasWebhookSecret = () =>
  useBackendQuery(
    "hasWebhookSecret",
    (a) => a.hasWebhookSecret(),
    false,
    30000,
  );
export const useHasBinanceCredentials = () =>
  useBackendQuery(
    "hasBinanceCredentials",
    (a) => a.hasBinanceCredentials(),
    false,
    30000,
  );
export const useDefaultOrderQuantity = () =>
  useBackendQuery(
    "defaultOrderQuantity",
    (a) => a.getDefaultOrderQuantity(),
    "",
  );
export const useTestnetMode = () =>
  useBackendQuery("testnetMode", (a) => a.getTestnetMode(), true, 15000);

// ─── Mutation hooks ───────────────────────────────────────────────────────────

export const useSetKillSwitch = () =>
  useBackendMutation((a, s: boolean) => a.setKillSwitch(s), "killSwitch");
export const useSetWebhookSecret = () =>
  useBackendMutation(
    (a, s: string) => a.setWebhookSecret(s),
    "hasWebhookSecret",
  );
export const useSetTestnetMode = () =>
  useBackendMutation((a, m: boolean) => a.setTestnetMode(m), "testnetMode");
export const useSetDefaultOrderQuantity = () =>
  useBackendMutation(
    (a, q: string) => a.setDefaultOrderQuantity(q),
    "defaultOrderQuantity",
  );
export const useClearBinanceCredentials = () =>
  useBackendMutation(
    (a) => a.clearBinanceCredentials(),
    "hasBinanceCredentials",
  );
export const useSetBinanceCredentials = () =>
  useBackendMutation(
    (a, p: { apiKey: string; apiSecret: string }) =>
      a.setBinanceCredentials(p.apiKey, p.apiSecret),
    "hasBinanceCredentials",
  );

export function useReceiveWebhook() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (p: {
      alertId: string;
      timestamp: string;
      symbol: string;
      side: string;
      signal: string;
      secretToken: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.receiveWebhook(
        p.alertId,
        p.timestamp,
        p.symbol,
        p.side,
        p.signal,
        p.secretToken,
      );
    },
  });
}

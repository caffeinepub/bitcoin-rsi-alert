import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AlertRecord } from "../backend.d";
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

function ema(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const result: (number | null)[] = [];
  let prev = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(...Array(period - 1).fill(null));
  result.push(prev);
  for (let i = period; i < data.length; i++) {
    prev = data[i] * k + prev * (1 - k);
    result.push(prev);
  }
  return result;
}

function calcRSI(closes: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = Array(period).fill(null);
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) avgGain += d;
    else avgLoss += Math.abs(d);
  }
  avgGain /= period;
  avgLoss /= period;
  result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
    result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  }
  return result;
}

function calcSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) result.push(null);
    else {
      const slice = data.slice(i - period + 1, i + 1);
      result.push(slice.reduce((a, b) => a + b, 0) / period);
    }
  }
  return result;
}

function formatDate(ts: number, timeframe: Timeframe): string {
  const d = new Date(ts);
  if (timeframe === "1m" || timeframe === "1h") {
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const INTERVAL_MAP: Record<Timeframe, string> = {
  "1m": "1m",
  "1h": "1h",
  "1D": "1d",
  "1w": "1w",
};
const LIMIT_MAP: Record<Timeframe, number> = {
  "1m": 500,
  "1h": 500,
  "1D": 500,
  "1w": 200,
};

async function fetchBitcoinData(timeframe: Timeframe) {
  const interval = INTERVAL_MAP[timeframe];
  const limit = LIMIT_MAP[timeframe];
  const res = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=${limit}`,
  );
  if (!res.ok) throw new Error("Failed to fetch Binance data");
  const klines: string[][] = await res.json();
  if (klines.length < 20) throw new Error("Not enough Binance data");

  const opens = klines.map((k) => Number.parseFloat(k[1]));
  const highs = klines.map((k) => Number.parseFloat(k[2]));
  const lows = klines.map((k) => Number.parseFloat(k[3]));
  const closes = klines.map((k) => Number.parseFloat(k[4]));
  const volumes = klines.map((k) => Number.parseFloat(k[5]));
  const timestamps = klines.map((k) => Number(k[0]));

  const rsiHistory = calcRSI(closes, 14);
  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const sma20 = calcSMA(closes, 20);

  const macdLine: (number | null)[] = closes.map((_, i) => {
    const e12 = ema12[i];
    const e26 = ema26[i];
    if (e12 === null || e26 === null) return null;
    return e12 - e26;
  });

  const macdNonNull = macdLine.filter((v): v is number => v !== null);
  const signalEma = ema(macdNonNull, 9);
  const firstMacdIdx = macdLine.findIndex((v) => v !== null);
  const signalLine: (number | null)[] = closes.map((_, i) => {
    const offset = i - firstMacdIdx;
    if (offset < 0 || offset >= signalEma.length) return null;
    return signalEma[offset];
  });

  const histogram: (number | null)[] = closes.map((_, i) => {
    const m = macdLine[i];
    const s = signalLine[i];
    if (m === null || s === null) return null;
    return m - s;
  });

  const chartData: ChartDataPoint[] = closes.map((close, i) => ({
    date: formatDate(timestamps[i], timeframe),
    close,
    open: opens[i],
    high: highs[i],
    low: lows[i],
    volume: volumes[i],
    rsi: rsiHistory[i] ?? null,
    macd: macdLine[i] ?? null,
    signal: signalLine[i] ?? null,
    histogram: histogram[i] ?? null,
    sma20: sma20[i] ?? null,
  }));

  const last = chartData[chartData.length - 1];

  return {
    chartData,
    currentPrice: last.close,
    currentRsi: last.rsi ?? 50,
    currentMacd: last.macd ?? 0,
    currentSignal: last.signal ?? 0,
    currentHistogram: last.histogram ?? 0,
    currentSma20: last.sma20 ?? last.close,
    timestamp: BigInt(Date.now()) * 1_000_000n,
  };
}

export function useBitcoinData(timeframe: Timeframe = "1D") {
  return useQuery({
    queryKey: ["bitcoinData", timeframe],
    queryFn: () => fetchBitcoinData(timeframe),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });
}

export function useAlertHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<AlertRecord[]>({
    queryKey: ["alertHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAlertHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCheckAndLogAlert() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ rsi, price }: { rsi: number; price: number }) => {
      if (!actor) return;
      await actor.checkAndLogAlert(rsi, price);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alertHistory"] });
    },
  });
}

export function useClearAlertHistory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return;
      await actor.clearAlertHistory();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alertHistory"] });
    },
  });
}

import { useQuery } from "@tanstack/react-query";

export function useVolume() {
  const { data, isLoading } = useQuery<number>({
    queryKey: ["btcVolume"],
    queryFn: async () => {
      const res = await fetch(
        "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=2",
      );
      if (!res.ok) throw new Error("Failed to fetch volume");
      const klines = await res.json();
      return Number.parseFloat(klines[0][7]);
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 60 * 1000,
  });

  return { volume: data ?? 0, isLoading };
}

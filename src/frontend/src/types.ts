export type DivergenceResult = {
  type: "bullish" | "bearish";
  prevIndex: number;
  currIndex: number;
} | null;

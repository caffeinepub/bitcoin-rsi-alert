import { TrendingDown, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { DivergenceResult } from "../types";

interface IndicatorsBannerProps {
  currentPrice: number;
  currentSma20: number;
  currentRsi: number;
  currentHistogram: number;
  currentMacd: number;
  freshBullishCrossover?: boolean;
  freshBearishCrossover?: boolean;
  prevHistogram?: number;
  rsiDivergence?: DivergenceResult;
  macdDivergence?: DivergenceResult;
  isExtremeBullish?: boolean;
  isExtremeBearish?: boolean;
}

type SignalTier = "bullish" | "extreme-bullish" | "bearish" | "extreme-bearish";

interface PillProps {
  label: string;
  tier: SignalTier;
  value: string;
  description: string;
  subTag?: { text: string; isBullish: boolean } | null;
  delay: number;
}

function Pill({ label, tier, value, description, subTag, delay }: PillProps) {
  const isBullish = tier === "bullish" || tier === "extreme-bullish";
  const isExtreme = tier === "extreme-bullish" || tier === "extreme-bearish";

  const borderClass = isExtreme
    ? tier === "extreme-bullish"
      ? "border-amber-400/40 bg-amber-500/8"
      : "border-violet-400/40 bg-violet-500/8"
    : isBullish
      ? "border-emerald-500/30 bg-emerald-500/5"
      : "border-red-500/30 bg-red-500/5";

  const iconBgClass = isExtreme
    ? tier === "extreme-bullish"
      ? "bg-amber-500/15"
      : "bg-violet-500/15"
    : isBullish
      ? "bg-emerald-500/15"
      : "bg-red-500/15";

  const iconColor = isExtreme
    ? tier === "extreme-bullish"
      ? "text-amber-400"
      : "text-violet-400"
    : isBullish
      ? "text-emerald-400"
      : "text-red-400";

  const badgeBgClass = isExtreme
    ? tier === "extreme-bullish"
      ? "bg-amber-500/20 text-amber-300"
      : "bg-violet-500/20 text-violet-300"
    : isBullish
      ? "bg-emerald-500/20 text-emerald-400"
      : "bg-red-500/20 text-red-400";

  const badgeText = isExtreme
    ? tier === "extreme-bullish"
      ? "⚡ EXTREME BULL"
      : "⚡ EXTREME BEAR"
    : isBullish
      ? "BULLISH"
      : "BEARISH";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`flex-1 min-w-0 rounded-xl border px-4 py-3 flex items-center gap-3 ${borderClass}`}
    >
      <div className={`rounded-lg p-2 flex-shrink-0 ${iconBgClass}`}>
        {isExtreme ? (
          <Zap className={`h-4 w-4 ${iconColor}`} />
        ) : isBullish ? (
          <TrendingUp className={`h-4 w-4 ${iconColor}`} />
        ) : (
          <TrendingDown className={`h-4 w-4 ${iconColor}`} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            {label}
          </span>
          <span
            className={`font-mono text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded ${badgeBgClass}`}
          >
            {badgeText}
          </span>
          {subTag && (
            <span
              className={`font-mono text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                subTag.isBullish
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-red-500/10 text-red-300 border-red-500/30"
              }`}
            >
              {subTag.text}
            </span>
          )}
        </div>
        <p className="font-mono text-sm font-bold text-foreground mt-0.5 truncate">
          {value}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function IndicatorsBanner({
  currentPrice,
  currentSma20,
  currentRsi,
  currentHistogram,
  currentMacd,
  freshBullishCrossover = false,
  freshBearishCrossover = false,
  rsiDivergence = null,
  macdDivergence = null,
  isExtremeBullish = false,
  isExtremeBearish = false,
}: IndicatorsBannerProps) {
  const priceAboveSma = currentPrice > currentSma20;
  const rsiBullish = currentRsi > 50;
  const macdBullish = currentHistogram > 0;

  const smaDiff = ((currentPrice - currentSma20) / currentSma20) * 100;

  const priceTier: SignalTier = isExtremeBullish
    ? "extreme-bullish"
    : isExtremeBearish
      ? "extreme-bearish"
      : priceAboveSma
        ? "bullish"
        : "bearish";

  const rsiTier: SignalTier = isExtremeBullish
    ? "extreme-bullish"
    : isExtremeBearish
      ? "extreme-bearish"
      : rsiBullish
        ? "bullish"
        : "bearish";

  const macdTier: SignalTier = isExtremeBullish
    ? "extreme-bullish"
    : isExtremeBearish
      ? "extreme-bearish"
      : macdBullish
        ? "bullish"
        : "bearish";

  let priceDescription: string;
  if (isExtremeBullish) {
    priceDescription = `Extreme surge · +${smaDiff.toFixed(1)}% above SMA20`;
  } else if (isExtremeBearish) {
    priceDescription = `Extreme drop · ${smaDiff.toFixed(1)}% below SMA20`;
  } else if (priceAboveSma) {
    priceDescription =
      smaDiff > 2 ? "Strong uptrend · SMA20 support" : "Marginal · near SMA20";
  } else {
    priceDescription = "Below average · watch for breakdown";
  }

  let rsiDescription: string;
  if (isExtremeBullish) {
    rsiDescription = "Overbought extremes — powerful trend or reversal risk";
  } else if (isExtremeBearish) {
    rsiDescription = "Oversold extremes — capitulation or reversal zone";
  } else if (currentRsi < 30) {
    rsiDescription = "Oversold — potential reversal zone";
  } else if (currentRsi > 70) {
    rsiDescription = "Overbought — elevated risk";
  } else if (currentRsi >= 50) {
    rsiDescription = "Bullish momentum building";
  } else {
    rsiDescription = "Bearish pressure · watch 50 level";
  }

  const rsiSubTag = rsiDivergence
    ? {
        text: rsiDivergence.type === "bullish" ? "↑ BULL DIV" : "↓ BEAR DIV",
        isBullish: rsiDivergence.type === "bullish",
      }
    : null;

  const macdSubTag = macdDivergence
    ? {
        text: macdDivergence.type === "bullish" ? "↑ BULL DIV" : "↓ BEAR DIV",
        isBullish: macdDivergence.type === "bullish",
      }
    : null;

  let macdDescription: string;
  if (isExtremeBullish) {
    macdDescription = `Strongly accelerating · hist +${currentHistogram.toFixed(0)}`;
  } else if (isExtremeBearish) {
    macdDescription = `Strongly declining · hist ${currentHistogram.toFixed(0)}`;
  } else if (freshBullishCrossover) {
    macdDescription = `Fresh bullish crossover! · hist +${currentHistogram.toFixed(0)}`;
  } else if (freshBearishCrossover) {
    macdDescription = `Fresh bearish crossover! · hist ${currentHistogram.toFixed(0)}`;
  } else if (macdBullish) {
    macdDescription = "Bullish crossover · momentum up";
  } else {
    macdDescription = "Bearish crossover · momentum down";
  }

  const macdValue = `MACD ${currentMacd >= 0 ? "above" : "below"} zero · hist ${
    currentHistogram >= 0 ? "+" : ""
  }${currentHistogram.toFixed(0)}`;

  return (
    <>
      <Pill
        label="PRICE"
        tier={priceTier}
        value={
          priceAboveSma
            ? `+${smaDiff.toFixed(2)}% SMA20`
            : `${smaDiff.toFixed(2)}% SMA20`
        }
        description={priceDescription}
        delay={0.1}
      />
      <Pill
        label="RSI · 14"
        tier={rsiTier}
        value={`RSI ${currentRsi.toFixed(1)}`}
        description={rsiDescription}
        subTag={rsiSubTag}
        delay={0.15}
      />
      <Pill
        label="MACD · 12/26/9"
        tier={macdTier}
        value={macdValue}
        description={macdDescription}
        subTag={macdSubTag}
        delay={0.2}
      />
    </>
  );
}

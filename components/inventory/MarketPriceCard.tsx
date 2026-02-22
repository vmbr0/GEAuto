"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

type EstimateStatus = "Bonne affaire" | "Prix aligné" | "Au-dessus du marché";

interface MarketEstimateData {
  baseEstimate: number;
  adjustedPrice: number;
  difference: number;
  percentageDiff: number;
  status: EstimateStatus;
  yourPrice: number;
}

interface MarketPriceCardProps {
  vehicleId: string;
  vehiclePrice: number;
}

const statusStyles: Record<EstimateStatus, string> = {
  "Bonne affaire":
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_20px_-5px_rgba(52,211,153,0.25)]",
  "Prix aligné":
    "bg-white/5 text-gray-400 border-white/10",
  "Au-dessus du marché":
    "bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_20px_-5px_rgba(248,113,113,0.25)]",
};

export default function MarketPriceCard({ vehicleId, vehiclePrice }: MarketPriceCardProps) {
  const [data, setData] = useState<MarketEstimateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(`/api/market-estimate?id=${encodeURIComponent(vehicleId)}&refresh=1`)
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-white/5 bg-[#111318] p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Prix du marché estimé</h3>
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          <span className="text-sm">Chargement de l&apos;estimation…</span>
        </div>
      </motion.div>
    );
  }

  if (error || !data) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-white/5 bg-[#111318] p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Prix du marché estimé</h3>
        <p className="text-sm text-gray-400">
          L&apos;estimation n&apos;est pas disponible pour le moment.
        </p>
      </motion.div>
    );
  }

  const { adjustedPrice, difference, percentageDiff, yourPrice } = data;
  // Recompute status from percentageDiff so display is always correct (even if cache was wrong)
  const status: EstimateStatus =
    percentageDiff < -5
      ? "Bonne affaire"
      : percentageDiff >= -5 && percentageDiff <= 5
        ? "Prix aligné"
        : "Au-dessus du marché";

  const minP = Math.min(adjustedPrice, yourPrice);
  const maxP = Math.max(adjustedPrice, yourPrice);
  const range = maxP - minP || 1;
  const yourPricePct = range > 0 ? ((yourPrice - minP) / range) * 100 : 50;
  const marketPct = range > 0 ? ((adjustedPrice - minP) / range) * 100 : 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-white/5 bg-[#111318] p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-gray-400" />
        <h3 className="text-xl font-bold text-white">Prix du marché estimé</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Prix marché estimé</p>
          <p className="text-3xl font-bold text-white">{adjustedPrice.toLocaleString()} €</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Votre prix</p>
          <p className="text-2xl font-semibold text-white">{yourPrice.toLocaleString()} €</p>
        </div>

        {/* Écart: négatif = votre prix en dessous du marché = bonne affaire (vert), positif = au-dessus (rouge) */}
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="text-sm text-gray-400">Écart </span>
            <span className={`text-lg font-semibold ${difference < 0 ? "text-emerald-400" : difference > 0 ? "text-red-400" : "text-gray-400"}`}>
              {difference >= 0 ? "+" : ""}{difference.toLocaleString()} €
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-400">Soit </span>
            <span className={`text-lg font-semibold ${percentageDiff < 0 ? "text-emerald-400" : percentageDiff > 0 ? "text-red-400" : "text-gray-400"}`}>
              {percentageDiff >= 0 ? "+" : ""}{percentageDiff} %
            </span>
          </div>
        </div>

        <div>
          <span className="text-sm text-gray-400 block mb-2">Statut</span>
          <span
            className={`inline-flex px-4 py-2 rounded-xl text-sm font-semibold border ${statusStyles[status]}`}
          >
            {status}
          </span>
        </div>

        {/* Premium price comparison bar: [ Market Low -------- • -------- Market High ] */}
        <div className="pt-6">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">Position par rapport au marché</p>
          <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent p-4 overflow-hidden">
            <div className="relative h-6 rounded-xl bg-gradient-to-r from-[#1a1f26] via-[#252b35] to-[#1a1f26] border border-white/5">
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white/90 cursor-default"
                style={{
                  left: `${yourPricePct}%`,
                  transform: "translate(-50%, -50%)",
                  boxShadow:
                    status === "Bonne affaire"
                      ? "0 0 20px 4px rgba(52, 211, 153, 0.4), 0 0 40px 8px rgba(52, 211, 153, 0.15)"
                      : status === "Au-dessus du marché"
                        ? "0 0 20px 4px rgba(248, 113, 113, 0.4), 0 0 40px 8px rgba(248, 113, 113, 0.15)"
                        : "0 0 12px 2px rgba(255, 255, 255, 0.2)",
                  backgroundColor:
                    status === "Bonne affaire"
                      ? "rgb(52, 211, 153)"
                      : status === "Au-dessus du marché"
                        ? "rgb(248, 113, 113)"
                        : "rgb(156, 163, 175)",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.2 }}
                whileHover={{ scale: 1.15 }}
              />
            </div>
            <div className="flex justify-between items-baseline mt-3 text-xs text-gray-400">
              <span>Marché bas · {minP.toLocaleString()} €</span>
              <span className="text-gray-300 font-medium">Votre prix · {yourPrice.toLocaleString()} €</span>
              <span>Marché haut · {maxP.toLocaleString()} €</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

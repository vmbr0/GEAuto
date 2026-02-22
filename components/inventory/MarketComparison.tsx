"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { BarChart3, ShoppingBag } from "lucide-react";

interface MarketComparisonProps {
  avgPriceLeboncoin?: number | null;
  avgPriceLaCentrale?: number | null;
  /** Show "Market data unavailable" when no data */
  showFallback?: boolean;
  /** Callback to trigger refresh; if provided, shows "Actualiser les prix marché" when no data */
  onRefresh?: () => void;
  /** Whether a refresh is in progress */
  refreshing?: boolean;
}

export default function MarketComparison({
  avgPriceLeboncoin,
  avgPriceLaCentrale,
  showFallback = true,
  onRefresh,
  refreshing = false,
}: MarketComparisonProps) {
  const hasData = avgPriceLeboncoin != null || avgPriceLaCentrale != null;

  if (!hasData) {
    if (!showFallback) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <div className="p-8 text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              Comparaison de marché
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Prix moyens Leboncoin et LaCentrale non disponibles pour l&apos;instant.
            </p>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refreshing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Actualisation…
                  </>
                ) : (
                  "Actualiser les prix marché"
                )}
              </button>
            )}
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="w-6 h-6 text-gray-400" />
            <h3 className="text-2xl font-bold text-gray-900">
              Comparaison de marché
            </h3>
          </div>

          <div className="space-y-6">
            {avgPriceLeboncoin != null && (
              <div className="pb-4 border-b border-gray-100">
                <div className="text-sm text-gray-500 mb-2">Prix moyen Leboncoin</div>
                <div className="text-3xl font-bold text-gray-900">
                  {avgPriceLeboncoin.toLocaleString()} €
                </div>
                <div className="text-xs text-gray-400 mt-1">Annonces similaires (marque, modèle, année)</div>
              </div>
            )}

            {avgPriceLaCentrale != null && (
              <div className="pb-4 border-b border-gray-100">
                <div className="text-sm text-gray-500 mb-2">Prix moyen LaCentrale</div>
                <div className="text-3xl font-bold text-gray-900">
                  {avgPriceLaCentrale.toLocaleString()} €
                </div>
                <div className="text-xs text-gray-400 mt-1">Annonces similaires (marque, modèle, année)</div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

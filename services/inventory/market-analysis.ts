import { prisma } from "@/lib/prisma";
import { importCostCalculator } from "@/services/inventory/import-cost-calculator";
import { priceComparisonService } from "@/services/scraping/price-comparison";
import type { MarketAnalysisResult } from "@/types/inventory";

/** Cache duration: do not re-scrape if last analysis is newer than this (ms) */
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Vehicle shape needed for analysis */
export interface VehicleForAnalysis {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  pricePurchase: number;
  cvFiscaux: number;
}

/**
 * Market analysis service: compare Germany/France market prices and import cost.
 * - Uses cache to avoid re-scraping too often.
 * - Never throws: returns null or partial result on failure.
 */
export class MarketAnalysisService {
  /**
   * Get cached comparison for vehicle if still valid.
   */
  private async getCachedComparison(vehicleId: string): Promise<{
    avgPriceGermany: number | null;
    avgPriceFrance: number | null;
    estimatedImportCost: number | null;
    difference: number | null;
    profitabilityScore: number | null;
    scrapedAt: Date;
  } | null> {
    const latest = await prisma.priceComparison.findFirst({
      where: { vehicleId },
      orderBy: { scrapedAt: "desc" },
    });
    if (!latest) return null;
    const age = Date.now() - latest.scrapedAt.getTime();
    if (age > CACHE_DURATION_MS) return null;
    return {
      avgPriceGermany: latest.avgPriceGermany,
      avgPriceFrance: latest.avgPriceFrance,
      estimatedImportCost: latest.estimatedImportCost,
      difference: latest.difference,
      profitabilityScore: latest.profitabilityScore,
      scrapedAt: latest.scrapedAt,
    };
  }

  /**
   * Compute estimated import cost for a vehicle (from GlobalSettings + CocPrice).
   */
  private async getEstimatedImportCost(vehicle: VehicleForAnalysis): Promise<number> {
    const calc = await importCostCalculator.calculateImportCost({
      purchasePrice: vehicle.pricePurchase,
      cvFiscaux: vehicle.cvFiscaux,
      brand: vehicle.brand,
    });
    return calc.total;
  }

  /**
   * Compute profitability score 0–100 from difference vs France price.
   */
  private getProfitabilityScore(
    difference: number | null,
    avgPriceFrance: number | null
  ): number | null {
    if (difference === null || avgPriceFrance == null || avgPriceFrance <= 0)
      return null;
    // Simple ratio: positive difference = good. Scale to 0-100 (e.g. +10% France price => 100)
    const ratio = difference / avgPriceFrance;
    const score = Math.min(100, Math.max(0, 50 + ratio * 500)); // 50 = neutral
    return Math.round(score);
  }

  /**
   * Analyze market price for a vehicle:
   * - Germany (mobile.de), France (Leboncoin/LaCentrale)
   * - Estimated import cost
   * - difference = avgPriceFrance - estimatedImportCost
   * - profitabilityScore
   * Uses cache; runs scrapers only if cache miss. Does not throw.
   */
  async analyzeMarketPrice(vehicle: VehicleForAnalysis): Promise<MarketAnalysisResult | null> {
    try {
      const estimatedImportCost = await this.getEstimatedImportCost(vehicle);

      const cached = await this.getCachedComparison(vehicle.id);
      if (cached) {
        const difference =
          cached.difference ??
          (cached.avgPriceFrance != null ? cached.avgPriceFrance - estimatedImportCost : null);
        const profitabilityScore =
          cached.profitabilityScore ??
          this.getProfitabilityScore(difference, cached.avgPriceFrance ?? null);
        return {
          avgPriceGermany: cached.avgPriceGermany ?? null,
          avgPriceFrance: cached.avgPriceFrance ?? null,
          estimatedImportCost: cached.estimatedImportCost ?? estimatedImportCost,
          difference,
          profitabilityScore,
        };
      }

      // Run scrapers (year ±2; mileage ±20% not in current price-comparison API, re-use existing)
      const comparison = await priceComparisonService.compareVehicleMarket({
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        useProxy: true,
      });

      const avgPriceGermany = comparison.avgPriceGermany ?? null;
      const avgPriceFrance = comparison.avgPriceFrance ?? null;
      const difference =
        avgPriceFrance != null ? avgPriceFrance - estimatedImportCost : null;
      const profitabilityScore = this.getProfitabilityScore(difference, avgPriceFrance ?? null);

      await prisma.priceComparison.create({
        data: {
          vehicleId: vehicle.id,
          avgPriceGermany: avgPriceGermany ?? undefined,
          avgPriceFrance: avgPriceFrance ?? undefined,
          avgPriceLeboncoin: comparison.avgPriceLeboncoin ?? undefined,
          avgPriceLaCentrale: comparison.avgPriceLaCentrale ?? undefined,
          estimatedImportCost,
          difference,
          profitabilityScore,
        },
      });

      return {
        avgPriceGermany,
        avgPriceFrance,
        estimatedImportCost,
        difference,
        profitabilityScore,
      };
    } catch (err) {
      console.error("Market analysis error:", err);
      return null;
    }
  }

  /**
   * Scrape Leboncoin et LaCentrale pour les annonces similaires (marque, modèle, année)
   * et enregistre les prix moyens. Appelé automatiquement à la création d'une annonce.
   * Ne lance pas d'exception : les erreurs sont loguées.
   */
  async scrapeFranceAndSave(vehicle: VehicleForAnalysis): Promise<void> {
    try {
      const { avgPriceLeboncoin, avgPriceLaCentrale } =
        await priceComparisonService.scrapeFranceOnly({
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          useProxy: true,
        });

      const francePrices = [avgPriceLeboncoin, avgPriceLaCentrale].filter(
        (p): p is number => p != null
      );
      const avgPriceFrance =
        francePrices.length > 0
          ? francePrices.reduce((a, b) => a + b, 0) / francePrices.length
          : null;

      await prisma.priceComparison.create({
        data: {
          vehicleId: vehicle.id,
          avgPriceLeboncoin: avgPriceLeboncoin ?? undefined,
          avgPriceLaCentrale: avgPriceLaCentrale ?? undefined,
          avgPriceFrance: avgPriceFrance ?? undefined,
        },
      });
    } catch (err) {
      console.error("scrapeFranceAndSave error:", err);
    }
  }

  /**
   * Get last saved market analysis for a vehicle (no scraping).
   * Returns null if none. Does not throw.
   */
  async getLastAnalysis(vehicleId: string): Promise<MarketAnalysisResult | null> {
    try {
      const row = await prisma.priceComparison.findFirst({
        where: { vehicleId },
        orderBy: { scrapedAt: "desc" },
      });
      if (!row) return null;

      let estimatedImportCost = row.estimatedImportCost;
      if (estimatedImportCost == null) {
        const vehicle = await prisma.inventoryVehicle.findUnique({
          where: { id: vehicleId },
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            mileage: true,
            pricePurchase: true,
            cvFiscaux: true,
          },
        });
        if (!vehicle) return null;
        estimatedImportCost = await this.getEstimatedImportCost(vehicle);
      }

      const difference =
        row.difference ??
        (row.avgPriceFrance != null ? row.avgPriceFrance - estimatedImportCost : null);
      const profitabilityScore =
        row.profitabilityScore ??
        this.getProfitabilityScore(difference, row.avgPriceFrance);

      return {
        avgPriceGermany: row.avgPriceGermany ?? null,
        avgPriceFrance: row.avgPriceFrance ?? null,
        estimatedImportCost,
        difference,
        profitabilityScore,
      };
    } catch (err) {
      console.error("Get last analysis error:", err);
      return null;
    }
  }
}

export const marketAnalysisService = new MarketAnalysisService();

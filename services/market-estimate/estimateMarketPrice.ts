/**
 * Market price estimation for vehicles.
 * Uses optional external API (MARKET_ESTIMATE_API_URL) or dev fallback.
 * Extendable for future LaCentrale / Argus API integration.
 */

export interface VehicleForEstimate {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number; // vehicle listing price (priceResale or pricePurchase)
}

export interface MarketEstimateResult {
  baseEstimate: number;
  adjustedPrice: number;
  difference: number;
  percentageDiff: number;
  status: "Bonne affaire" | "Prix aligné" | "Au-dessus du marché";
}

const MILEAGE_ADJUSTMENT_PER_KM = 0.05;
const CACHE_TTL_SEC = 24 * 60 * 60; // 24h

/**
 * Status from percentage difference (STRICT).
 * Negative percentage = vehicle cheaper than market = good.
 * Positive percentage = vehicle more expensive than market = above market.
 * No Math.abs, no sign inversion.
 */
function getStatus(percentageDiff: number): MarketEstimateResult["status"] {
  if (percentageDiff < -5) return "Bonne affaire";
  if (percentageDiff >= -5 && percentageDiff <= 5) return "Prix aligné";
  return "Au-dessus du marché";
}

/**
 * Call external estimation API (keyless or with env key).
 * Expected response: { estimated_price: number } or { estimatedPrice: number }.
 * Returns null on any error.
 */
async function fetchExternalEstimate(brand: string, model: string, year: number): Promise<number | null> {
  const baseUrl = process.env.MARKET_ESTIMATE_API_URL;
  if (!baseUrl) return null;

  const url = new URL(baseUrl);
  url.searchParams.set("brand", brand);
  url.searchParams.set("model", model);
  url.searchParams.set("year", String(year));

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const price = Number(data?.estimated_price ?? data?.estimatedPrice ?? data?.price);
    return Number.isFinite(price) ? price : null;
  } catch {
    return null;
  }
}

/**
 * Dev fallback when no API is configured or API fails.
 * Simple heuristic by year and mileage. Replace with LaCentrale/Argus later.
 */
function devFallbackEstimate(year: number, mileage: number): number {
  const currentYear = new Date().getFullYear();
  const ageYears = Math.max(0, currentYear - year);
  const mileageDepreciation = Math.min(mileage / 10_000, 30) * 400; // cap effect
  const base = 28_000 - ageYears * 1_200 - mileageDepreciation;
  return Math.max(5_000, Math.round(base));
}

/**
 * Estimate market price for a vehicle.
 * 1) Try external API for base estimate.
 * 2) Apply mileage adjustment: adjustedPrice = baseEstimate - (mileage * 0.05).
 * 3) Compute difference and status.
 * Returns null on unrecoverable error (caller can show error state).
 */
export async function estimateMarketPrice(vehicle: VehicleForEstimate): Promise<MarketEstimateResult | null> {
  try {
    const { brand, model, year, mileage, price } = vehicle;
    let baseEstimate = await fetchExternalEstimate(brand, model, year);
    if (baseEstimate == null) {
      baseEstimate = devFallbackEstimate(year, mileage);
    }

    const adjustedMarketPrice = Math.round(baseEstimate - mileage * MILEAGE_ADJUSTMENT_PER_KM);
    const safeAdjusted = Math.max(1, adjustedMarketPrice);
    // difference = vehicle.price - adjustedMarketPrice (keep sign)
    const difference = Math.round(price - safeAdjusted);
    // percentageDiff = (difference / adjustedMarketPrice) * 100 (no Math.abs)
    const percentageDiff = Math.round((difference / safeAdjusted) * 100 * 10) / 10;
    const status = getStatus(percentageDiff);

    console.log({
      market: safeAdjusted,
      price: vehicle.price,
      difference,
      percentageDiff,
      status,
    });

    return {
      baseEstimate,
      adjustedPrice: safeAdjusted,
      difference,
      percentageDiff,
      status,
    };
  } catch {
    return null;
  }
}

export { CACHE_TTL_SEC };

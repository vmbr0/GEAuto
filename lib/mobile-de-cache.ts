import { getRedis } from "./redis";

const CACHE_PREFIX = "mobilede:cache:";
const LAST_PREFIX = "mobilede:last:";
const CACHE_TTL_SEC = 6 * 60 * 60; // 6 hours

export interface CachedSession {
  sessionId: string;
  count: number;
}

export function mobileDeCacheKey(params: {
  brand: string;
  model: string;
  year?: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
}): string {
  const parts = [
    params.brand,
    params.model,
    params.year ?? "",
    params.mileage ?? "",
    params.fuelType ?? "",
    params.transmission ?? "",
  ];
  return parts.join("|").toLowerCase();
}

export async function getCachedSession(key: string): Promise<CachedSession | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    const raw = await client.get(CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as CachedSession;
  } catch {
    return null;
  }
}

export async function setCachedSession(key: string, data: CachedSession): Promise<void> {
  const client = getRedis();
  if (!client) return;
  try {
    await client.setex(CACHE_PREFIX + key, CACHE_TTL_SEC, JSON.stringify(data));
    await client.set(LAST_PREFIX + key, JSON.stringify(data)); // no TTL for fallback on failure
  } catch (e) {
    console.error("[mobile-de cache] set failed:", e);
  }
}

/** Last known good result (used when scraping fails). */
export async function getLastCachedSession(key: string): Promise<CachedSession | null> {
  const client = getRedis();
  if (!client) return null;
  try {
    const raw = await client.get(LAST_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as CachedSession;
  } catch {
    return null;
  }
}

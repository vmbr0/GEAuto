/**
 * Internal rate limiting for vehicle search.
 * - Max 1 scraping job per query (queryHash) every 5 minutes.
 */
import { getRedis } from "./redis";
import { logSearchWarn } from "./logger";

const RATE_LIMIT_TTL_SEC = 60 * 5; // 5 minutes
const KEY_PREFIX = "search:ratelimit:";

export async function canRunSearch(queryHash: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return true; // no Redis = no rate limit
  try {
    const key = KEY_PREFIX + queryHash;
    const exists = await redis.get(key);
    return !exists;
  } catch (e) {
    logSearchWarn("rate_limit_check", "Rate limit check failed, allowing", { queryHash });
    return true;
  }
}

export async function recordSearchStarted(queryHash: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    const key = KEY_PREFIX + queryHash;
    await redis.set(key, "1", "EX", RATE_LIMIT_TTL_SEC);
  } catch {
    // ignore
  }
}

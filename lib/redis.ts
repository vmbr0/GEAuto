import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

let redis: Redis | null = null;

/**
 * Get Redis connection for queue and cache.
 * Returns null if REDIS_URL is not set (queue/cache disabled).
 */
export function getRedis(): Redis | null {
  if (!REDIS_URL) return null;
  if (redis) return redis;
  try {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    });
    redis.on("error", (err) => console.error("[Redis]", err.message));
    return redis;
  } catch (e) {
    console.error("[Redis] Connection failed:", e);
    return null;
  }
}

export function isRedisAvailable(): boolean {
  return !!REDIS_URL && !!getRedis();
}

/** Options for BullMQ (avoids ioredis version conflict). */
export function getRedisConnectionOptions(): { host: string; port: number; password?: string } | null {
  if (!REDIS_URL) return null;
  try {
    const u = new URL(REDIS_URL);
    return {
      host: u.hostname,
      port: parseInt(u.port || "6379", 10),
      ...(u.password && { password: u.password }),
    };
  } catch {
    return null;
  }
}

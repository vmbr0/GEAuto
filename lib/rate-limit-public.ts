/**
 * Rate limit for public endpoints (inquiry, appointment).
 * Uses in-memory store per IP; optional Redis if available.
 */

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function getKey(ip: string, prefix: string): string {
  return `public:${prefix}:${ip}`;
}

export function isRateLimited(ip: string, prefix: string): boolean {
  const key = getKey(ip, prefix);
  const entry = memoryStore.get(key);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    memoryStore.delete(key);
    return false;
  }
  return entry.count >= MAX_REQUESTS;
}

export function recordRequest(ip: string, prefix: string): void {
  const key = getKey(ip, prefix);
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

/** Stricter limit for auth-related endpoints (forgot password, reset). */
const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 min
const AUTH_MAX = 5;
const authStore = new Map<string, { count: number; resetAt: number }>();

export function isAuthRateLimited(ip: string, key: string): boolean {
  const fullKey = `auth:${key}:${ip}`;
  const entry = authStore.get(fullKey);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    authStore.delete(fullKey);
    return false;
  }
  return entry.count >= AUTH_MAX;
}

export function recordAuthRequest(ip: string, key: string): void {
  const fullKey = `auth:${key}:${ip}`;
  const now = Date.now();
  const entry = authStore.get(fullKey);
  if (!entry || now > entry.resetAt) {
    authStore.set(fullKey, { count: 1, resetAt: now + AUTH_WINDOW_MS });
    return;
  }
  entry.count += 1;
}

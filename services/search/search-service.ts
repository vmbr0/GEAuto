/**
 * Search service: normalize query, cache lookup, enqueue job.
 * Does not block API thread; returns cached result or "in progress".
 */
import { prisma } from "@/lib/prisma";
import { SearchResultStatus } from "@prisma/client";
import { addSearchJob } from "@/lib/queue/search-queue";
import { canRunSearch, recordSearchStarted } from "@/lib/rate-limit";
import { logSearchEvent, logSearchError } from "@/lib/logger";
import type { SearchJobPayload } from "@/lib/queue/search-queue";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export interface SearchQueryParams {
  brand: string;
  model: string;
  yearMin?: number;
  yearMax?: number;
  mileageMax?: number;
  fuelType?: string;
  transmission?: string;
}

function normalizeQuery(params: Record<string, unknown>): SearchQueryParams {
  const brand = String(params.brand || "").trim();
  const model = String(params.model || "").trim();
  const yearMin = params.yearMin != null ? Number(params.yearMin) : undefined;
  const yearMax = params.yearMax != null ? Number(params.yearMax) : undefined;
  const mileageMax = params.mileageMax != null ? Number(params.mileageMax) : undefined;
  const fuelType = params.fuelType != null ? String(params.fuelType) : undefined;
  const transmission = params.transmission != null ? String(params.transmission) : undefined;
  return { brand, model, yearMin, yearMax, mileageMax, fuelType, transmission };
}

function queryHash(params: SearchQueryParams): string {
  const str = JSON.stringify({
    brand: params.brand.toLowerCase(),
    model: params.model.toLowerCase(),
    yearMin: params.yearMin ?? "",
    yearMax: params.yearMax ?? "",
    mileageMax: params.mileageMax ?? "",
    fuelType: params.fuelType ?? "",
    transmission: params.transmission ?? "",
  });
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return "v1-" + Math.abs(h).toString(36);
}

export type SearchServiceResult =
  | { status: "cached"; queryHash: string; results: unknown[]; cachedAt: Date }
  | { status: "in_progress"; queryHash: string }
  | { status: "error"; message: string };

export async function handleSearchRequest(params: Record<string, unknown>): Promise<SearchServiceResult> {
  const query = normalizeQuery(params);
  if (!query.brand || !query.model) {
    return { status: "error", message: "brand and model are required" };
  }

  const hash = queryHash(query);
  logSearchEvent("query_received", "Search query received", { queryHash: hash, query });

  try {
    // 1) Check cache: success and fresh
    const cached = await prisma.searchResultCache.findUnique({
      where: { queryHash: hash },
    });
    if (cached && cached.status === SearchResultStatus.SUCCESS && cached.results) {
      const age = Date.now() - new Date(cached.updatedAt).getTime();
      if (age < CACHE_TTL_MS) {
        const results = cached.results as unknown[];
        logSearchEvent("cache_hit", "Returning cached results", { queryHash: hash, resultCount: results.length });
        return { status: "cached", queryHash: hash, results, cachedAt: cached.updatedAt };
      }
    }

    // 2) Rate limit: one job per query per 5 min
    const allowed = await canRunSearch(hash);
    if (!allowed) {
      // Return last successful cache if any (even stale)
      if (cached && cached.status === SearchResultStatus.SUCCESS && cached.results) {
        const results = cached.results as unknown[];
        return { status: "cached", queryHash: hash, results, cachedAt: cached.updatedAt };
      }
      return { status: "in_progress", queryHash: hash };
    }

    // 3) Enqueue job
    const payload: SearchJobPayload = {
      queryHash: hash,
      queryParams: query,
      createdAt: new Date().toISOString(),
    };
    const job = await addSearchJob(payload);
    if (!job) {
      if (cached && cached.status === SearchResultStatus.SUCCESS && cached.results) {
        const results = cached.results as unknown[];
        return { status: "cached", queryHash: hash, results, cachedAt: cached.updatedAt };
      }
      return { status: "error", message: "Search temporarily unavailable (queue unavailable)" };
    }

    await recordSearchStarted(hash);
    return { status: "in_progress", queryHash: hash };
  } catch (e) {
    logSearchError("search_service", "Search service error", {
      queryHash: hash,
      error: (e as Error).message,
      stack: (e as Error).stack,
    });
    return { status: "error", message: "Search temporarily unavailable" };
  }
}

/**
 * Get last successful cached result for a query (e.g. after timeout).
 */
export async function getLastSuccessfulResult(queryHash: string): Promise<unknown[] | null> {
  const row = await prisma.searchResultCache.findUnique({
    where: { queryHash },
  });
  if (row && row.status === SearchResultStatus.SUCCESS && row.results) return row.results as unknown[];
  return null;
}

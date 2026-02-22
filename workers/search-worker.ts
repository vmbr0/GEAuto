/**
 * Vehicle search worker: processes jobs from the search queue.
 * - Concurrency: 2. Delay 2–3s between jobs.
 * - Runs scraper → parser → validate → store in SearchResultCache.
 * - Never crashes: wrap in try/catch, log and mark job failed on error.
 */
import { Worker, Job } from "bullmq";
import { getRedisConnectionOptions } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { SearchResultStatus } from "@prisma/client";
import { SEARCH_QUEUE_NAME, type SearchJobPayload } from "@/lib/queue/search-queue";
import { logSearchEvent, logSearchError, logSearchWarn } from "@/lib/logger";
import { fetchSearchPage, ScraperBlockedError } from "@/services/scraping/vehicle-scraper";
import { parseVehicleListFromHtml, validateParsedResults } from "@/services/scraping/vehicle-parser";

const BASE_URL = "https://www.mobile.de";
const INTER_JOB_DELAY_MS = 2500; // 2–3 seconds
const CONCURRENCY = 2;

function buildSearchUrl(params: SearchJobPayload["queryParams"]): string {
  const sp = new URLSearchParams();
  sp.set("makeModelVariant1.makeId", params.brand);
  sp.set("makeModelVariant1.modelId", params.model);
  if (params.yearMin != null) sp.set("minFirstRegistrationDate", `${params.yearMin}-01-01`);
  if (params.yearMax != null) sp.set("maxFirstRegistrationDate", `${params.yearMax}-12-31`);
  if (params.mileageMax != null) sp.set("maxMileage", String(params.mileageMax));
  if (params.fuelType) sp.set("fuel", params.fuelType);
  if (params.transmission) sp.set("transmission", params.transmission);
  return `${BASE_URL}/suchen/auto?${sp.toString()}`;
}

async function processJob(job: Job<SearchJobPayload>): Promise<void> {
  const start = Date.now();
  const { queryHash, queryParams } = job.data;

  logSearchEvent("job_started", "Search job started", { jobId: job.id, queryHash, query: queryParams });

  try {
    const url = buildSearchUrl(queryParams);
    const { html, url: finalUrl } = await fetchSearchPage(url);

    const vehicles = parseVehicleListFromHtml(html, BASE_URL);
    const validated = validateParsedResults(vehicles);

    if (!validated.valid) {
      logSearchWarn("job_completed", "Parser validation failed; not storing empty/suspicious result", {
        jobId: job.id,
        queryHash,
        reason: validated.reason,
        rawCount: vehicles.length,
      });
      await prisma.searchResultCache.upsert({
        where: { queryHash },
        create: {
          queryHash,
          queryParams: queryParams as object,
          status: SearchResultStatus.FAILED,
          failureReason: validated.reason,
        },
        update: {
          results: null,
          status: SearchResultStatus.FAILED,
          failureReason: validated.reason,
          updatedAt: new Date(),
        },
      });
      return;
    }

    const resultsJson = validated.vehicles as unknown[];
    await prisma.searchResultCache.upsert({
      where: { queryHash },
      create: {
        queryHash,
        queryParams: queryParams as object,
        results: resultsJson,
        status: SearchResultStatus.SUCCESS,
      },
      update: {
        results: resultsJson,
        status: SearchResultStatus.SUCCESS,
        failureReason: null,
        updatedAt: new Date(),
      },
    });

    const durationMs = Date.now() - start;
    logSearchEvent("job_completed", "Search job completed", {
      jobId: job.id,
      queryHash,
      durationMs,
      resultCount: resultsJson.length,
      status: "success",
    });
  } catch (e) {
    const durationMs = Date.now() - start;
    const isBlocked = e instanceof ScraperBlockedError;
    const status = isBlocked ? SearchResultStatus.BLOCKED : SearchResultStatus.FAILED;
    const failureReason = (e as Error).message || "unknown";

    logSearchError("job_failed", "Search job failed", {
      jobId: job.id,
      queryHash,
      durationMs,
      failureReason,
      blocked: isBlocked,
      error: (e as Error).message,
      stack: (e as Error).stack,
    });

    try {
      await prisma.searchResultCache.upsert({
        where: { queryHash },
        create: {
          queryHash,
          queryParams: queryParams as object,
          status,
          failureReason,
        },
        update: {
          results: null,
          status,
          failureReason,
          updatedAt: new Date(),
        },
      });
    } catch (dbErr) {
      logSearchError("job_failed", "Failed to store failure state in DB", { queryHash, error: String(dbErr) });
    }

    throw e; // Let BullMQ handle retry
  }
}

function main(): void {
  const conn = getRedisConnectionOptions();
  if (!conn) {
    logSearchError("worker", "Redis not available. Set REDIS_URL.", {});
    process.exit(1);
  }

  const worker = new Worker<SearchJobPayload>(SEARCH_QUEUE_NAME, async (job) => {
    await new Promise((r) => setTimeout(r, INTER_JOB_DELAY_MS));
    return processJob(job);
  }, {
    connection: conn,
    concurrency: CONCURRENCY,
  });

  worker.on("failed", (job, err) => {
    logSearchError("worker", "Job failed (retries exhausted or error)", {
      jobId: job?.id,
      queryHash: job?.data?.queryHash,
      error: err?.message,
    });
  });

  worker.on("error", (err) => {
    logSearchError("worker", "Worker error", { error: err?.message });
  });

  logSearchEvent("worker", "Search worker started", { concurrency: CONCURRENCY });
}

main();

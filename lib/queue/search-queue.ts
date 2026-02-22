/**
 * BullMQ queue for vehicle search scraping jobs.
 * - Max 3 attempts, exponential backoff, 60s timeout.
 * - Concurrency and rate limiting applied at worker level.
 */
import { Queue, Job } from "bullmq";
import { getRedisConnectionOptions } from "../redis";
import { logSearchEvent, logSearchError } from "../logger";

export const SEARCH_QUEUE_NAME = "vehicle-search";

export interface SearchJobPayload {
  queryHash: string;
  queryParams: {
    brand: string;
    model: string;
    yearMin?: number;
    yearMax?: number;
    mileageMax?: number;
    fuelType?: string;
    transmission?: string;
  };
  createdAt: string; // ISO
}

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 2000, // 2s, then 4s, then 8s
  },
  timeout: 60_000, // 60 seconds per attempt
  removeOnComplete: { count: 200 },
  removeOnFail: { count: 100 },
};

let queueInstance: Queue<SearchJobPayload> | null = null;

export function getSearchQueue(): Queue<SearchJobPayload> | null {
  const conn = getRedisConnectionOptions();
  if (!conn) return null;
  if (queueInstance) return queueInstance;
  try {
    queueInstance = new Queue<SearchJobPayload>(SEARCH_QUEUE_NAME, {
      connection: conn,
      defaultJobOptions,
    });
    return queueInstance;
  } catch (e) {
    logSearchError("queue_init", "Search queue init failed", { error: String(e) });
    return null;
  }
}

export async function addSearchJob(payload: SearchJobPayload): Promise<Job<SearchJobPayload> | null> {
  const q = getSearchQueue();
  if (!q) return null;
  const job = await q.add("scrape", payload, {
    jobId: payload.queryHash, // dedupe by query hash when possible
  });
  logSearchEvent("job_created", "Search job enqueued", {
    jobId: job.id,
    queryHash: payload.queryHash,
    query: payload.queryParams,
  });
  return job;
}

// Re-export for worker
export type { Job };

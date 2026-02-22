import { Queue, Worker, Job } from "bullmq";
import { getRedis, getRedisConnectionOptions } from "./redis";

const QUEUE_NAME = "mobile-de-scrape";

export interface MobileDeJobPayload {
  sessionId: string;
  userId: string;
  brand: string;
  model: string;
  year?: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  maxResults?: number;
  useProxy?: boolean;
}

const defaultJobOptions = {
  attempts: 1,
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 50 },
};

let queueInstance: Queue<MobileDeJobPayload> | null = null;

export function getMobileDeQueue(): Queue<MobileDeJobPayload> | null {
  const connOpts = getRedisConnectionOptions();
  if (!connOpts) return null;
  if (queueInstance) return queueInstance;
  try {
    queueInstance = new Queue<MobileDeJobPayload>(QUEUE_NAME, {
      connection: connOpts,
      defaultJobOptions,
    });
    return queueInstance;
  } catch (e) {
    console.error("[mobile-de queue] init failed:", e);
    return null;
  }
}

export function addMobileDeJob(payload: MobileDeJobPayload): Promise<Job<MobileDeJobPayload> | null> {
  const q = getMobileDeQueue();
  if (!q) return Promise.resolve(null);
  return q.add("scrape", payload);
}

/** Create worker; call from worker script with processor. */
export function createMobileDeWorker(
  processor: (job: Job<MobileDeJobPayload>) => Promise<void>
): Worker<MobileDeJobPayload> | null {
  const connOpts = getRedisConnectionOptions();
  if (!connOpts) return null;
  try {
    const worker = new Worker<MobileDeJobPayload>(QUEUE_NAME, processor, {
      connection: connOpts,
      concurrency: 1,
    });
    worker.on("failed", (job, err) => {
      console.error("[mobile-de worker] Job failed:", job?.id, err.message);
    });
    return worker;
  } catch (e) {
    console.error("[mobile-de worker] create failed:", e);
    return null;
  }
}

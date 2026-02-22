import { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { createMobileDeWorker, MobileDeJobPayload } from "@/lib/mobile-de-queue";
import { runMobileDeScrape, ScraperBlockedError } from "@/services/scraping/mobile-de-playwright";
import { setCachedSession, mobileDeCacheKey } from "@/lib/mobile-de-cache";

async function processJob(job: Job<MobileDeJobPayload>): Promise<void> {
  const { sessionId, userId, brand, model, year, mileage, fuelType, transmission, maxResults, useProxy } = job.data;

  try {
    const vehicles = await runMobileDeScrape({
      brand,
      model,
      year,
      mileage,
      fuelType: fuelType as import("@prisma/client").FuelType | undefined,
      transmission: transmission as import("@prisma/client").Transmission | undefined,
      maxResults: maxResults ?? 100,
      useProxy: useProxy !== false,
    });

    for (const v of vehicles) {
      await prisma.scrapedVehicle.create({
        data: {
          sessionId,
          requestId: null,
          title: v.title,
          price: v.price,
          mileage: v.mileage,
          location: v.location,
          images: v.images,
          link: v.link,
        },
      });
    }

    await prisma.searchSession.update({
      where: { id: sessionId },
      data: { resultCount: vehicles.length },
    });

    const cacheKey = mobileDeCacheKey({ brand, model, year, mileage, fuelType, transmission });
    await setCachedSession(cacheKey, { sessionId, count: vehicles.length });
  } catch (e) {
    if (e instanceof ScraperBlockedError) {
      console.error("[mobile-de worker] Blocked/captcha, aborting job", job.id);
    } else {
      console.error("[mobile-de worker] Scrape error", job.id, e);
    }
    throw e;
  }
}

function main() {
  const worker = createMobileDeWorker(processJob);
  if (!worker) {
    console.error("[mobile-de worker] Redis not available. Set REDIS_URL.");
    process.exit(1);
  }
  console.log("[mobile-de worker] Started");
}

main();

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getCachedSession,
  getLastCachedSession,
  setCachedSession,
  mobileDeCacheKey,
} from "@/lib/mobile-de-cache";
import { addMobileDeJob } from "@/lib/mobile-de-queue";
import { isRedisAvailable } from "@/lib/redis";
import { runMobileDeScrape } from "@/services/scraping/mobile-de-playwright";
import { FuelType, Transmission } from "@prisma/client";

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 120000;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const {
      brand,
      model,
      year,
      mileage,
      fuelType,
      transmission,
      requestId,
      maxResults,
      useProxy,
    } = body;

    if (!brand || !model) {
      return NextResponse.json({ error: "Marque et modèle requis" }, { status: 400 });
    }

    const cacheKey = mobileDeCacheKey({
      brand,
      model,
      year: year || undefined,
      mileage: mileage || undefined,
      fuelType: fuelType || undefined,
      transmission: transmission || undefined,
    });

    if (isRedisAvailable()) {
      const cached = await getCachedSession(cacheKey);
      if (cached) {
        const vehicles = await prisma.scrapedVehicle.findMany({
          where: { sessionId: cached.sessionId },
          take: 10,
        });
        return NextResponse.json({
          message: "Résultats en cache",
          count: cached.count,
          sessionId: cached.sessionId,
          vehicles,
        });
      }

      const searchSession = await prisma.searchSession.create({
        data: {
          userId: session.user.id!,
          searchType: "vehicle",
          brand,
          model,
          year: year || null,
          mileage: mileage || null,
          fuelType: fuelType || null,
          transmission: transmission || null,
          resultCount: 0,
        },
      });

      const job = await addMobileDeJob({
        sessionId: searchSession.id,
        userId: session.user.id!,
        brand,
        model,
        year: year || undefined,
        mileage: mileage || undefined,
        fuelType: fuelType || undefined,
        transmission: transmission || undefined,
        maxResults: maxResults || 100,
        useProxy: useProxy !== false,
      });

      if (!job) {
        const last = await getLastCachedSession(cacheKey);
        if (last) {
          const vehicles = await prisma.scrapedVehicle.findMany({
            where: { sessionId: last.sessionId },
            take: 10,
          });
          return NextResponse.json({
            message: "File non disponible, dernier résultat connu",
            count: last.count,
            sessionId: last.sessionId,
            vehicles,
          });
        }
        return NextResponse.json(
          { error: "Redis non disponible. Vérifiez REDIS_URL." },
          { status: 503 }
        );
      }

      const deadline = Date.now() + POLL_TIMEOUT_MS;
      while (Date.now() < deadline) {
        const updated = await prisma.searchSession.findUnique({
          where: { id: searchSession.id },
          include: { scrapedVehicles: { take: 10 } },
        });
        if (updated && updated.resultCount > 0) {
          await setCachedSession(cacheKey, {
            sessionId: searchSession.id,
            count: updated.resultCount,
          });
          return NextResponse.json({
            message: "Recherche terminée",
            count: updated.resultCount,
            sessionId: searchSession.id,
            vehicles: updated.scrapedVehicles,
          });
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      }

      const last = await getLastCachedSession(cacheKey);
      if (last) {
        const vehicles = await prisma.scrapedVehicle.findMany({
          where: { sessionId: last.sessionId },
          take: 10,
        });
        return NextResponse.json({
          message: "Délai dépassé, dernier résultat connu",
          count: last.count,
          sessionId: last.sessionId,
          vehicles,
        });
      }
      return NextResponse.json(
        {
          error: "Délai dépassé. Soit le worker n'est pas démarré (lancez 'npm run worker:mobile-de'), soit mobile.de a affiché un captcha/bloc. Vérifiez que l'option « Utiliser proxy » est décochée et consultez Admin > Résultats de scraping.",
          sessionId: searchSession.id,
        },
        { status: 504 }
      );
    }

    const searchSession = await prisma.searchSession.create({
      data: {
        userId: session.user.id!,
        searchType: "vehicle",
        brand,
        model,
        year: year || null,
        mileage: mileage || null,
        fuelType: fuelType || null,
        transmission: transmission || null,
        resultCount: 0,
      },
    });

    let vehicles: Awaited<ReturnType<typeof runMobileDeScrape>>;
    try {
      vehicles = await runMobileDeScrape({
        brand,
        model,
        year: year || undefined,
        mileage: mileage || undefined,
        fuelType: fuelType as FuelType | undefined,
        transmission: transmission as Transmission | undefined,
        maxResults: maxResults || 100,
        useProxy: useProxy !== false,
      });
    } catch (e) {
      console.error("[mobile-de API] Scrape error:", e);
      const last = await getLastCachedSession(cacheKey);
      if (last) {
        const list = await prisma.scrapedVehicle.findMany({
          where: { sessionId: last.sessionId },
          take: 10,
        });
        return NextResponse.json({
          message: "Erreur scraping, dernier résultat connu",
          count: last.count,
          sessionId: last.sessionId,
          vehicles: list,
        });
      }
      return NextResponse.json(
        { error: (e as Error).message || "Erreur lors du scraping" },
        { status: 500 }
      );
    }

    const savedVehicles = [];
    for (const v of vehicles) {
      const saved = await prisma.scrapedVehicle.create({
        data: {
          sessionId: searchSession.id,
          requestId: requestId || null,
          title: v.title,
          price: v.price,
          mileage: v.mileage,
          location: v.location,
          images: v.images,
          link: v.link,
        },
      });
      savedVehicles.push(saved);
    }
    await prisma.searchSession.update({
      where: { id: searchSession.id },
      data: { resultCount: savedVehicles.length },
    });

    return NextResponse.json({
      message: "Recherche terminée",
      count: savedVehicles.length,
      sessionId: searchSession.id,
      vehicles: savedVehicles.slice(0, 10),
    });
  } catch (error: unknown) {
    console.error("[mobile-de API]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Erreur lors du scraping" },
      { status: 500 }
    );
  }
}

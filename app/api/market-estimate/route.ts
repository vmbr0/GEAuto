/**
 * GET /api/market-estimate?id={vehicleId}
 * Returns market price estimation for an inventory vehicle. Cached 24h.
 */
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import { estimateMarketPrice, CACHE_TTL_SEC } from "@/services/market-estimate/estimateMarketPrice";

const CACHE_KEY_PREFIX = "market-estimate:";

export async function GET(req: NextRequest) {
  try {
    const vehicleId = req.nextUrl.searchParams.get("id");
    if (!vehicleId) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const skipCache = req.nextUrl.searchParams.get("refresh") === "1";
    const redis = getRedis();
    const cacheKey = CACHE_KEY_PREFIX + vehicleId;
    if (redis && !skipCache) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached) as object;
        return NextResponse.json(data);
      }
    }

    const vehicle = await prisma.inventoryVehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const price = vehicle.priceResale ?? vehicle.pricePurchase;
    const result = await estimateMarketPrice({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.mileage,
      price,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Estimation temporarily unavailable" },
        { status: 503 }
      );
    }

    const payload = {
      ...result,
      yourPrice: price,
    };

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(payload), "EX", CACHE_TTL_SEC);
    }

    return NextResponse.json(payload);
  } catch (e) {
    console.error("[market-estimate]", e);
    return NextResponse.json(
      { error: "Estimation temporarily unavailable" },
      { status: 503 }
    );
  }
}

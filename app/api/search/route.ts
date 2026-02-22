/**
 * GET /api/search?brand=BMW&model=320&yearMin=2015
 * - Validate input, normalize, check cache, enqueue if needed.
 * - Returns cached results, "search in progress", or error. Never crashes.
 */
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { handleSearchRequest } from "@/services/search/search-service";
import { logSearchError } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brand = searchParams.get("brand") ?? undefined;
    const model = searchParams.get("model") ?? undefined;
    const yearMin = searchParams.get("yearMin");
    const yearMax = searchParams.get("yearMax");
    const mileageMax = searchParams.get("mileageMax");
    const fuelType = searchParams.get("fuelType") ?? undefined;
    const transmission = searchParams.get("transmission") ?? undefined;

    const params: Record<string, unknown> = {
      brand: brand ?? "",
      model: model ?? "",
      yearMin: yearMin != null ? parseInt(yearMin, 10) : undefined,
      yearMax: yearMax != null ? parseInt(yearMax, 10) : undefined,
      mileageMax: mileageMax != null ? parseInt(mileageMax, 10) : undefined,
      fuelType,
      transmission,
    };

    const result = await handleSearchRequest(params);

    if (result.status === "cached") {
      return NextResponse.json({
        status: "success",
        source: "cache",
        queryHash: result.queryHash,
        results: result.results,
        cachedAt: result.cachedAt.toISOString(),
      });
    }

    if (result.status === "in_progress") {
      return NextResponse.json({
        status: "in_progress",
        message: "Search in progress",
        queryHash: result.queryHash,
      });
    }

    return NextResponse.json(
      { status: "error", message: result.message },
      { status: 503 }
    );
  } catch (e) {
    logSearchError("api", "Search API error", {
      error: (e as Error).message,
      stack: (e as Error).stack,
    });
    return NextResponse.json(
      { status: "error", message: "Search temporarily unavailable" },
      { status: 503 }
    );
  }
}

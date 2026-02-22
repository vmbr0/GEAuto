import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { marketAnalysisService } from "@/services/inventory/market-analysis";

/**
 * Lance le scraping Leboncoin + LaCentrale pour ce véhicule et enregistre les prix.
 * Retourne le véhicule à jour avec priceComparisons.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const vehicle = await prisma.inventoryVehicle.findUnique({
      where: { slug: params.slug },
      include: {
        priceComparisons: {
          orderBy: { scrapedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    await marketAnalysisService.scrapeFranceAndSave({
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.mileage,
      pricePurchase: vehicle.pricePurchase,
      cvFiscaux: vehicle.cvFiscaux,
    });

    const updated = await prisma.inventoryVehicle.findUnique({
      where: { slug: params.slug },
      include: {
        priceComparisons: {
          orderBy: { scrapedAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json(updated ?? vehicle);
  } catch (error: any) {
    console.error("Market refresh error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'actualisation des prix marché" },
      { status: 500 }
    );
  }
}

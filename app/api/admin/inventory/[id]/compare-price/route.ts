import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { marketAnalysisService } from "@/services/inventory/market-analysis";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const vehicle = await prisma.inventoryVehicle.findUnique({
      where: { id: params.id },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    const analysis = await marketAnalysisService.analyzeMarketPrice({
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.mileage,
      pricePurchase: vehicle.pricePurchase,
      cvFiscaux: vehicle.cvFiscaux,
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Impossible d'analyser le marché (scraping ou erreur)" },
        { status: 500 }
      );
    }

    const potentialMargin = analysis.difference ?? null;
    if (potentialMargin !== null) {
      await prisma.inventoryVehicle.update({
        where: { id: vehicle.id },
        data: { potentialMargin },
      });
    }

    return NextResponse.json({
      analysis,
      potentialMargin,
    });
  } catch (error: any) {
    console.error("Error comparing prices:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la comparaison des prix" },
      { status: 500 }
    );
  }
}

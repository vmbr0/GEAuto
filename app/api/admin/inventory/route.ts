import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateSlug, validateVehicleData } from "@/lib/utils/inventory";
import { importCostCalculator } from "@/services/inventory/import-cost-calculator";
import { marketAnalysisService } from "@/services/inventory/market-analysis";
import { isTableMissingError } from "@/lib/get-global-settings";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      brand,
      model,
      year,
      mileage,
      fuelType,
      transmission,
      color,
      cvFiscaux,
      powerHp,
      pricePurchase,
      priceResale,
      countryOrigin,
      description,
      status,
      coverImage,
      images,
    } = body;

    // Validation
    const validation = validateVehicleData({
      title,
      brand,
      model,
      year,
      mileage,
      cvFiscaux,
      pricePurchase,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    // Générer le slug
    const slug = generateSlug(title, brand, model, year);

    // Calculer les coûts d'importation
    const importCostData = await importCostCalculator.calculateImportCost({
      purchasePrice: pricePurchase,
      cvFiscaux,
      brand,
    });

    // Créer le véhicule
    const vehicle = await prisma.inventoryVehicle.create({
      data: {
        slug,
        title,
        brand,
        model,
        year,
        mileage,
        fuelType,
        transmission,
        color: color || null,
        cvFiscaux,
        powerHp: powerHp != null ? powerHp : undefined,
        pricePurchase,
        priceResale: priceResale || null,
        countryOrigin: countryOrigin || "DE",
        coverImage: coverImage || null,
        images: images || [],
        description: description || null,
        status: status || "AVAILABLE",
        importCost: importCostData.total,
        potentialMargin: null,
      },
    });

    // Scraping auto en arrière-plan : Leboncoin + LaCentrale (annonces similaires)
    marketAnalysisService
      .scrapeFranceAndSave({
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        mileage: vehicle.mileage,
        pricePurchase: vehicle.pricePurchase,
        cvFiscaux: vehicle.cvFiscaux,
      })
      .catch((err) => console.error("Background scrape France:", err));

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating vehicle:", error);
    if (isTableMissingError(error)) {
      return NextResponse.json(
        {
          error:
            "Les tables de la base sont absentes. Lancez le projet avec : npm run dev (ou npx prisma db push puis npm run dev:skip-db).",
        },
        { status: 503 }
      );
    }
    const message = error instanceof Error ? error.message : "Erreur lors de la création du véhicule";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

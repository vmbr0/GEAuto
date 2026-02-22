import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    return NextResponse.json(vehicle);
  } catch (error: any) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération du véhicule" },
      { status: 500 }
    );
  }
}

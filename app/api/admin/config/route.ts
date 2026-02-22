import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getGlobalSettingsWithFallback } from "@/lib/get-global-settings";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const settings = await getGlobalSettingsWithFallback();

    let defaultCocPrice = 200;
    try {
      const cocPrice = await prisma.cocPrice.findFirst();
      defaultCocPrice = cocPrice?.price ?? 200;
    } catch {
      // Table coc_prices peut être absente aussi
    }

    return NextResponse.json({
      regionPricePerCV: settings.regionPricePerCV,
      defaultTransportCost: settings.defaultTransportCost,
      germanPlateCost: settings.germanTempPlateCost,
      cocPrice: defaultCocPrice,
    });
  } catch (error: unknown) {
    console.error("Error fetching config:", error);
    const message = error instanceof Error ? error.message : "Erreur lors de la récupération de la configuration";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

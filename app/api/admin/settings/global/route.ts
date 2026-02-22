import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { globalSettingsSchema } from "@/lib/validations/settings";
import { getGlobalSettingsWithFallback, isTableMissingError } from "@/lib/get-global-settings";

const DEFAULT_KEY = "default";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const settings = await getGlobalSettingsWithFallback();

    return NextResponse.json({
      regionPricePerCV: settings.regionPricePerCV,
      defaultTransportCost: settings.defaultTransportCost,
      germanTempPlateCost: settings.germanTempPlateCost,
    });
  } catch (error: unknown) {
    console.error("Error fetching global settings:", error);
    const message = error instanceof Error ? error.message : "Erreur lors de la récupération des paramètres";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = globalSettingsSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const settings = await prisma.globalSettings.upsert({
      where: { key: DEFAULT_KEY },
      create: {
        key: DEFAULT_KEY,
        ...parsed.data,
      },
      update: parsed.data,
    });

    return NextResponse.json({
      regionPricePerCV: settings.regionPricePerCV,
      defaultTransportCost: settings.defaultTransportCost,
      germanTempPlateCost: settings.germanTempPlateCost,
    });
  } catch (error: unknown) {
    console.error("Error updating global settings:", error);
    if (isTableMissingError(error)) {
      return NextResponse.json(
        {
          error:
            "La table global_settings n'existe pas. À la racine du projet, exécutez : npx prisma db push",
        },
        { status: 503 }
      );
    }
    const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cocPriceSchema } from "@/lib/validations/settings";
import { isTableMissingError } from "@/lib/get-global-settings";

const DB_PUSH_MESSAGE =
  "La table coc_prices n'existe pas. À la racine du projet, exécutez : npx prisma db push";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    try {
      const cocPrices = await prisma.cocPrice.findMany({
        orderBy: { brand: "asc" },
      });
      return NextResponse.json(cocPrices);
    } catch (dbError) {
      if (isTableMissingError(dbError)) {
        return NextResponse.json([]);
      }
      throw dbError;
    }
  } catch (error: unknown) {
    console.error("Error fetching COC prices:", error);
    const message = error instanceof Error ? error.message : "Erreur lors de la récupération";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    const parsed = cocPriceSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const brand = parsed.data.brand.toUpperCase();

    const existing = await prisma.cocPrice.findUnique({
      where: { brand },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Cette marque existe déjà" },
        { status: 400 }
      );
    }

    const cocPrice = await prisma.cocPrice.create({
      data: {
        brand,
        price: parsed.data.price,
      },
    });

    return NextResponse.json(cocPrice, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating COC price:", error);
    if (isTableMissingError(error)) {
      return NextResponse.json({ error: DB_PUSH_MESSAGE }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Erreur lors de la création";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

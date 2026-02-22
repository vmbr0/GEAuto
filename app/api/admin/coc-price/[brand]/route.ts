import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isTableMissingError } from "@/lib/get-global-settings";

const DEFAULT_COC_PRICE = 200;

export async function GET(
  req: NextRequest,
  { params }: { params: { brand: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    try {
      const cocPrice = await prisma.cocPrice.findUnique({
        where: { brand: params.brand.toUpperCase() },
      });
      return NextResponse.json({
        price: cocPrice?.price ?? DEFAULT_COC_PRICE,
      });
    } catch (dbError) {
      if (isTableMissingError(dbError)) {
        return NextResponse.json({ price: DEFAULT_COC_PRICE });
      }
      throw dbError;
    }
  } catch (error: unknown) {
    console.error("Error fetching COC price:", error);
    const message = error instanceof Error ? error.message : "Erreur lors de la récupération du prix COC";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

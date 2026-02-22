import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cocPriceSchema } from "@/lib/validations/settings";
import { isTableMissingError } from "@/lib/get-global-settings";

const DB_PUSH_MESSAGE =
  "La table coc_prices n'existe pas. À la racine du projet, exécutez : npx prisma db push";

export async function PUT(
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

    const body = await req.json();
    const parsed = cocPriceSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const cocPrice = await prisma.cocPrice.update({
      where: { id: params.id },
      data: {
        brand: parsed.data.brand.toUpperCase(),
        price: parsed.data.price,
      },
    });

    return NextResponse.json(cocPrice);
  } catch (error: unknown) {
    console.error("Error updating COC price:", error);
    if (isTableMissingError(error)) {
      return NextResponse.json({ error: DB_PUSH_MESSAGE }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
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

    await prisma.cocPrice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Prix COC supprimé" });
  } catch (error: unknown) {
    console.error("Error deleting COC price:", error);
    if (isTableMissingError(error)) {
      return NextResponse.json({ error: DB_PUSH_MESSAGE }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Erreur lors de la suppression";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

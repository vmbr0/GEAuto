import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole, RequestStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { type, id } = params;
    const { status } = await req.json();

    if (!Object.values(RequestStatus).includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    if (type === "vehicle") {
      await prisma.vehicleRequest.update({
        where: { id },
        data: { status },
      });
    } else if (type === "parts") {
      await prisma.partsRequest.update({
        where: { id },
        data: { status },
      });
    } else {
      return NextResponse.json(
        { error: "Type de demande invalide" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Statut mis à jour avec succès" });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

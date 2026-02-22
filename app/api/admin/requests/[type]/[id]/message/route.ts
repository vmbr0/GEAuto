import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function POST(
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
    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Le message ne peut pas être vide" },
        { status: 400 }
      );
    }

    // Get request to find userId
    let userId: string;
    if (type === "vehicle") {
      const request = await prisma.vehicleRequest.findUnique({
        where: { id },
        select: { userId: true },
      });
      if (!request) {
        return NextResponse.json(
          { error: "Demande introuvable" },
          { status: 404 }
        );
      }
      userId = request.userId;
    } else if (type === "parts") {
      const request = await prisma.partsRequest.findUnique({
        where: { id },
        select: { userId: true },
      });
      if (!request) {
        return NextResponse.json(
          { error: "Demande introuvable" },
          { status: 404 }
        );
      }
      userId = request.userId;
    } else {
      return NextResponse.json(
        { error: "Type de demande invalide" },
        { status: 400 }
      );
    }

    // Create message
    if (type === "vehicle") {
      await prisma.vehicleMessage.create({
        data: {
          requestId: id,
          senderId: session.user.id,
          content: content.trim(),
        },
      });
    } else if (type === "parts") {
      await prisma.partsMessage.create({
        data: {
          requestId: id,
          senderId: session.user.id,
          content: content.trim(),
        },
      });
    }

    return NextResponse.json({ message: "Message envoyé avec succès" });
  } catch (error) {
    console.error("Message creation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}

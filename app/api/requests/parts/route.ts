import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { partsRequestSchema } from "@/lib/validations/requests";
import { RequestStatus } from "@prisma/client";
import { emailService } from "@/services/email-service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validate input
    const validatedData = partsRequestSchema.parse(body);

    // Create parts request
    const partsRequest = await prisma.partsRequest.create({
      data: {
        userId: session.user.id,
        partName: validatedData.partName,
        vehicleModel: validatedData.vehicleModel ?? undefined,
        year: validatedData.year ?? undefined,
        vin: validatedData.vin ?? undefined,
        budget: validatedData.budget ?? undefined,
        notes: validatedData.notes ?? undefined,
        status: RequestStatus.PENDING,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const u = partsRequest.user;
    const firstName = (u as any).firstName ?? (u.name?.split(" ")[0]) ?? "Client";
    const lastName = (u as any).lastName ?? (u.name?.split(" ").slice(1).join(" ")) ?? "";
    emailService.sendPartsRequestConfirmation({
      to: u.email,
      firstName,
      lastName,
      partName: partsRequest.partName,
      vehicleModel: partsRequest.vehicleModel ?? undefined,
      notes: partsRequest.notes ?? undefined,
    });

    return NextResponse.json(
      { message: "Demande créée avec succès", request: partsRequest },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Parts request error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la demande" },
      { status: 500 }
    );
  }
}

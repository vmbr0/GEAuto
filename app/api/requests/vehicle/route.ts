import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vehicleRequestSchema } from "@/lib/validations/requests";
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
    const validatedData = vehicleRequestSchema.parse(body);

    // Create vehicle request
    const vehicleRequest = await prisma.vehicleRequest.create({
      data: {
        userId: session.user.id,
        brand: validatedData.brand,
        model: validatedData.model,
        yearMin: validatedData.yearMin ?? undefined,
        yearMax: validatedData.yearMax ?? undefined,
        mileageMin: validatedData.mileageMin ?? undefined,
        mileageMax: validatedData.mileageMax ?? undefined,
        fuelType: validatedData.fuelType ?? undefined,
        transmission: validatedData.transmission ?? undefined,
        color: validatedData.color ?? undefined,
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

    const u = vehicleRequest.user;
    const firstName = (u as any).firstName ?? (u.name?.split(" ")[0]) ?? "Client";
    const lastName = (u as any).lastName ?? (u.name?.split(" ").slice(1).join(" ")) ?? "";
    emailService.sendVehicleRequestConfirmation({
      to: u.email,
      firstName,
      lastName,
      brand: vehicleRequest.brand,
      model: vehicleRequest.model,
      notes: vehicleRequest.notes ?? undefined,
    });

    return NextResponse.json(
      { message: "Demande créée avec succès", request: vehicleRequest },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Vehicle request error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la demande" },
      { status: 500 }
    );
  }
}

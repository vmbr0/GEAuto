import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAppointmentSchemaLegacy } from "@/lib/validations/appointment";
import { appointmentService } from "@/services/appointment-service";
import {
  getClientIp,
  isRateLimited,
  recordRequest,
} from "@/lib/rate-limit-public";

async function resolveVehicle(idOrSlug: string) {
  const byId = await prisma.inventoryVehicle.findUnique({
    where: { id: idOrSlug },
  });
  if (byId) return byId;
  return prisma.inventoryVehicle.findUnique({
    where: { slug: idOrSlug },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = getClientIp(req);
  if (isRateLimited(ip, "appointment")) {
    return NextResponse.json(
      { error: "Trop de demandes. Réessayez dans une minute." },
      { status: 429 }
    );
  }

  try {
    const vehicle = await resolveVehicle(params.id);
    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = createAppointmentSchemaLegacy.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return NextResponse.json(
        { error: first?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    const appointment = await appointmentService.create({
      vehicleId: vehicle.id,
      userId,
      data: parsed.data,
    });

    recordRequest(ip, "appointment");

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Appointment create error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la prise de rendez-vous" },
      { status: 500 }
    );
  }
}

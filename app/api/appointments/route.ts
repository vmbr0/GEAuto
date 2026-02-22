import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAppointmentSchema } from "@/lib/validations/appointment";
import { appointmentService } from "@/services/appointment-service";
import {
  getClientIp,
  isRateLimited,
  recordRequest,
} from "@/lib/rate-limit-public";
import { emailService } from "@/services/email-service";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

async function resolveVehicleId(vehicleIdOrSlug: string): Promise<string | null> {
  const byId = await prisma.inventoryVehicle.findUnique({
    where: { id: vehicleIdOrSlug },
    select: { id: true },
  });
  if (byId) return byId.id;
  const bySlug = await prisma.inventoryVehicle.findUnique({
    where: { slug: vehicleIdOrSlug },
    select: { id: true },
  });
  return bySlug?.id ?? null;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isRateLimited(ip, "appointment")) {
    return NextResponse.json(
      { error: "Trop de demandes. Réessayez dans une minute." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = createAppointmentSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return NextResponse.json(
        { error: first?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const vehicleId = await resolveVehicleId(parsed.data.vehicleId);
    if (!vehicleId) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    const appointment = await appointmentService.createWithSlot({
      vehicleId,
      userId,
      date: parsed.data.date,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
    });

    recordRequest(ip, "appointment");

    emailService.sendAppointmentConfirmation({
      to: appointment.email,
      firstName: appointment.firstName,
      lastName: appointment.lastName,
      vehicleTitle: appointment.vehicle.title,
      date: format(appointment.preferredDate, "EEEE d MMMM yyyy", { locale: fr }),
      startTime: appointment.startTime!,
      endTime: appointment.endTime!,
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la prise de rendez-vous";
    if (message.includes("plus disponible")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    console.error("Appointments POST error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

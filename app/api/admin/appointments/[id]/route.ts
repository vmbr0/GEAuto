import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { appointmentService } from "@/services/appointment-service";
import { updateAppointmentSchema } from "@/lib/validations/appointment";
import { emailService } from "@/services/email-service";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const appointment = await appointmentService.findById(params.id);
    if (!appointment) {
      return NextResponse.json(
        { error: "Rendez-vous non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Admin appointment get error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const existing = await appointmentService.findById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: "Rendez-vous non trouvé" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = updateAppointmentSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return NextResponse.json(
        { error: first?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const appointment = await appointmentService.update(params.id, parsed.data);
    if (parsed.data.status && appointment.startTime && appointment.endTime) {
      emailService.sendAppointmentStatusUpdate({
        to: appointment.email,
        firstName: appointment.firstName,
        lastName: appointment.lastName,
        vehicleTitle: appointment.vehicle.title,
        date: format(appointment.preferredDate, "EEEE d MMMM yyyy", { locale: fr }),
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
      });
    }
    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Admin appointment update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

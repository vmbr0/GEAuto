import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { appointmentService } from "@/services/appointment-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const month = req.nextUrl.searchParams.get("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "Paramètre month requis (format YYYY-MM)" },
        { status: 400 }
      );
    }
    const vehicleId = req.nextUrl.searchParams.get("vehicleId") ?? undefined;

    const result = await appointmentService.listByMonth({ month, vehicleId });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin appointments month GET error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des rendez-vous" },
      { status: 500 }
    );
  }
}

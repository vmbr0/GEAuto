import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }
    const list = await prisma.availability.findMany({
      orderBy: { dayOfWeek: "asc" },
    });
    return NextResponse.json(list);
  } catch (error) {
    console.error("Admin availability GET error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

function normalizeTime(value: unknown): string {
  if (typeof value !== "string" || !/^\d{1,2}:\d{2}$/.test(value)) return "09:00";
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return "09:00";
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }
    const body = await req.json();
    const rawDay = body.dayOfWeek;
    const dayOfWeek = typeof rawDay === "number" ? rawDay : parseInt(String(rawDay), 10);
    if (Number.isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { error: "dayOfWeek doit être entre 0 et 6" },
        { status: 400 }
      );
    }
    const startTime = normalizeTime(body.startTime ?? "09:00");
    const endTime = normalizeTime(body.endTime ?? "18:00");
    const duration = Math.max(5, Math.min(120, Number(body.slotDuration) || 30));
    const isActive = body.isActive === true || body.isActive === "true" || body.isActive !== false;

    const availability = await prisma.availability.upsert({
      where: { dayOfWeek },
      create: {
        dayOfWeek,
        startTime,
        endTime,
        slotDuration: duration,
        isActive,
      },
      update: {
        startTime,
        endTime,
        slotDuration: duration,
        isActive,
      },
    });
    return NextResponse.json(availability);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Admin availability PUT error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour", details: process.env.NODE_ENV === "development" ? message : undefined },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const where: { date?: { gte?: Date; lte?: Date } } = {};
    if (from) where.date = { ...where.date, gte: new Date(from) };
    if (to) where.date = { ...where.date, lte: new Date(to) };
    const list = await prisma.blockedDate.findMany({
      where,
      orderBy: { date: "asc" },
    });
    return NextResponse.json(list);
  } catch (error) {
    console.error("Admin blocked-dates GET error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }
    const body = await req.json();
    const date = new Date(body.date);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }
    date.setUTCHours(0, 0, 0, 0);
    const blocked = await prisma.blockedDate.upsert({
      where: { date },
      create: { date, reason: body.reason ?? null },
      update: { reason: body.reason ?? null },
    });
    return NextResponse.json(blocked, { status: 201 });
  } catch (error) {
    console.error("Admin blocked-dates POST error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}

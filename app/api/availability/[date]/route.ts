import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/services/availability-service";

export async function GET(
  req: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const dateStr = params.date;
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Date invalide" },
        { status: 400 }
      );
    }

    const slots = await getAvailableSlots(date);
    return NextResponse.json({ date: dateStr, slots });
  } catch (error) {
    console.error("Availability GET error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des créneaux" },
      { status: 500 }
    );
  }
}

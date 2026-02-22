import { NextRequest, NextResponse } from "next/server";
import { getMonthAvailability } from "@/services/availability-service";

export async function GET(req: NextRequest) {
  try {
    const month = req.nextUrl.searchParams.get("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: "Paramètre month requis (format YYYY-MM)" },
        { status: 400 }
      );
    }
    const summary = await getMonthAvailability(month);
    return NextResponse.json({ month, days: summary });
  } catch (error) {
    console.error("Availability month GET error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des disponibilités" },
      { status: 500 }
    );
  }
}

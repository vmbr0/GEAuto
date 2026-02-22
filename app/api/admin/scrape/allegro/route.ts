import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { scrapeAllegro } from "@/services/scraping/allegro";
import { translateToPolish } from "@/services/translation/libretranslate";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { query, requestId } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Requête de recherche requise" },
        { status: 400 }
      );
    }

    // Translate query to Polish
    const polishQuery = await translateToPolish(query.trim());

    // Scrape Allegro
    const parts = await scrapeAllegro(polishQuery);

    // If requestId provided, save to database
    if (requestId) {
      for (const part of parts) {
        await prisma.scrapedPart.create({
          data: {
            requestId,
            title: part.title,
            price: part.price,
            seller: part.seller,
            images: part.images,
            link: part.link,
          },
        });
      }
    }

    return NextResponse.json({
      message: "Recherche terminée",
      count: parts.length,
      parts: parts.slice(0, 10), // Return first 10 for preview
    });
  } catch (error: any) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors du scraping" },
      { status: 500 }
    );
  }
}

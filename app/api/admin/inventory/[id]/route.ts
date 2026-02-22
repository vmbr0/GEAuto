import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const vehicle = await prisma.inventoryVehicle.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { inquiries: true, appointments: true },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicle);
  } catch (error: any) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération du véhicule" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const existing = await prisma.inventoryVehicle.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};

    if (body.status !== undefined) data.status = body.status;
    if (body.title !== undefined) data.title = body.title;
    if (body.brand !== undefined) data.brand = body.brand;
    if (body.model !== undefined) data.model = body.model;
    if (body.year !== undefined) data.year = body.year;
    if (body.mileage !== undefined) data.mileage = body.mileage;
    if (body.fuelType !== undefined) data.fuelType = body.fuelType;
    if (body.transmission !== undefined) data.transmission = body.transmission;
    if (body.color !== undefined) data.color = body.color;
    if (body.cvFiscaux !== undefined) data.cvFiscaux = body.cvFiscaux;
    if (body.powerHp !== undefined) data.powerHp = body.powerHp;
    if (body.pricePurchase !== undefined) data.pricePurchase = body.pricePurchase;
    if (body.priceResale !== undefined) data.priceResale = body.priceResale;
    if (body.countryOrigin !== undefined) data.countryOrigin = body.countryOrigin;
    if (body.description !== undefined) data.description = body.description;
    if (body.coverImage !== undefined) data.coverImage = body.coverImage;
    if (body.images !== undefined) data.images = body.images;
    if (body.importCost !== undefined) data.importCost = body.importCost;
    if (body.potentialMargin !== undefined) data.potentialMargin = body.potentialMargin;

    const vehicle = await prisma.inventoryVehicle.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(vehicle);
  } catch (error: any) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la mise à jour du véhicule" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    await prisma.inventoryVehicle.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la suppression du véhicule" },
      { status: 500 }
    );
  }
}

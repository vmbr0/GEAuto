import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VehicleStatus, FuelType, Transmission } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    // Filtres
    const brand = searchParams.get("brand");
    const model = searchParams.get("model");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minYear = searchParams.get("minYear");
    const maxYear = searchParams.get("maxYear");
    const maxMileage = searchParams.get("maxMileage");
    const fuelType = searchParams.get("fuelType") as FuelType | null;
    const transmission = searchParams.get("transmission") as Transmission | null;
    const status = searchParams.get("status") as VehicleStatus | null;
    
    // Tri
    const sortBy = searchParams.get("sortBy") || "newest"; // newest, priceAsc, priceDesc
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {};

    if (brand) where.brand = { contains: brand, mode: "insensitive" };
    if (model) where.model = { contains: model, mode: "insensitive" };
    if (status) where.status = status;
    if (fuelType) where.fuelType = fuelType;
    if (transmission) where.transmission = transmission;
    
    if (minPrice || maxPrice) {
      where.priceResale = {};
      if (minPrice) where.priceResale.gte = parseFloat(minPrice);
      if (maxPrice) where.priceResale.lte = parseFloat(maxPrice);
    }
    
    if (minYear || maxYear) {
      where.year = {};
      if (minYear) where.year.gte = parseInt(minYear);
      if (maxYear) where.year.lte = parseInt(maxYear);
    }
    
    if (maxMileage) {
      where.mileage = { lte: parseInt(maxMileage) };
    }

    // Construire le tri
    let orderBy: any = {};
    switch (sortBy) {
      case "priceAsc":
        orderBy = { priceResale: "asc" };
        break;
      case "priceDesc":
        orderBy = { priceResale: "desc" };
        break;
      case "brandAsc":
        orderBy = { brand: "asc" };
        break;
      case "brandDesc":
        orderBy = { brand: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Récupérer les véhicules
    const [vehicles, total] = await Promise.all([
      prisma.inventoryVehicle.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.inventoryVehicle.count({ where }),
    ]);

    return NextResponse.json({
      vehicles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération de l'inventaire" },
      { status: 500 }
    );
  }
}

import { FuelType, Transmission, VehicleStatus } from "@prisma/client";

export interface InventoryVehicleInput {
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  color?: string;
  cvFiscaux: number;
  pricePurchase: number;
  priceResale?: number;
  countryOrigin?: string;
  description?: string;
  status?: VehicleStatus;
}

export interface InventoryVehicle extends InventoryVehicleInput {
  id: string;
  slug: string;
  images: string[];
  importCost?: number;
  potentialMargin?: number;
  createdAt: Date;
  updatedAt: Date;
  status: VehicleStatus;
}

export interface ImportCostCalculation {
  purchasePrice: number;
  carteGrise: number;
  cocPrice: number;
  germanTempPlateCost: number;
  transportCost: number;
  total: number;
}

export interface PriceComparisonResult {
  avgPriceGermany?: number;
  avgPriceFrance?: number;
  avgPriceLeboncoin?: number;
  avgPriceLaCentrale?: number;
  difference?: number;
}

/** Result of analyzeMarketPrice for a vehicle */
export interface MarketAnalysisResult {
  avgPriceGermany: number | null;
  avgPriceFrance: number | null;
  estimatedImportCost: number;
  difference: number | null; // avgPriceFrance - estimatedImportCost
  profitabilityScore: number | null; // 0-100
}

export interface AdminConfigValues {
  regionPricePerCV: number;
  defaultTransportCost: number;
  germanPlateCost: number;
}

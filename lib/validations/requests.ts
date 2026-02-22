import { z } from "zod";
import { FuelType, Transmission } from "@prisma/client";

export const vehicleRequestSchema = z.object({
  brand: z.string().min(1, "La marque est requise"),
  model: z.string().min(1, "Le modèle est requis"),
  yearMin: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional().nullable(),
  yearMax: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional().nullable(),
  mileageMin: z.number().int().min(0).optional().nullable(),
  mileageMax: z.number().int().min(0).optional().nullable(),
  fuelType: z.nativeEnum(FuelType).optional().nullable(),
  transmission: z.nativeEnum(Transmission).optional().nullable(),
  color: z.string().optional().nullable(),
  budget: z.number().positive("Le budget doit être positif").optional().nullable(),
  notes: z.string().max(2000, "Les notes ne peuvent pas dépasser 2000 caractères").optional().nullable(),
}).refine((data) => {
  if (data.yearMin && data.yearMax && data.yearMin > data.yearMax) {
    return false;
  }
  return true;
}, {
  message: "L'année minimum doit être inférieure ou égale à l'année maximum",
  path: ["yearMax"],
}).refine((data) => {
  if (data.mileageMin && data.mileageMax && data.mileageMin > data.mileageMax) {
    return false;
  }
  return true;
}, {
  message: "Le kilométrage minimum doit être inférieur ou égal au kilométrage maximum",
  path: ["mileageMax"],
});

export const partsRequestSchema = z.object({
  partName: z.string().min(1, "Le nom de la pièce est requis").max(200, "Le nom ne peut pas dépasser 200 caractères"),
  vehicleModel: z.string().max(200).optional().nullable(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional().nullable(),
  vin: z.string().max(17).optional().nullable(),
  budget: z.number().positive("Le budget doit être positif").optional().nullable(),
  notes: z.string().max(2000, "Les notes ne peuvent pas dépasser 2000 caractères").optional().nullable(),
});

export type VehicleRequestInput = z.infer<typeof vehicleRequestSchema>;
export type PartsRequestInput = z.infer<typeof partsRequestSchema>;

import { z } from "zod";
import { FuelType, Transmission, VehicleStatus } from "@prisma/client";

export const inventoryVehicleSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(200),
  brand: z.string().min(1, "La marque est requise").max(100),
  model: z.string().min(1, "Le modèle est requis").max(100),
  year: z
    .number()
    .int("L'année doit être un nombre entier")
    .min(1900, "L'année doit être supérieure à 1900")
    .max(new Date().getFullYear() + 1, "L'année ne peut pas être dans le futur"),
  mileage: z
    .number()
    .int("Le kilométrage doit être un nombre entier")
    .min(0, "Le kilométrage ne peut pas être négatif"),
  fuelType: z.nativeEnum(FuelType, {
    errorMap: () => ({ message: "Type de carburant invalide" }),
  }),
  transmission: z.nativeEnum(Transmission, {
    errorMap: () => ({ message: "Type de transmission invalide" }),
  }),
  color: z.string().max(50).optional().nullable(),
  cvFiscaux: z
    .number()
    .int("Les CV fiscaux doivent être un nombre entier")
    .min(1, "Les CV fiscaux doivent être supérieurs à 0")
    .max(100),
  powerHp: z
    .number()
    .int("La puissance doit être un nombre entier")
    .min(0, "La puissance ne peut pas être négative")
    .max(2000)
    .optional()
    .nullable(),
  pricePurchase: z
    .number()
    .min(0, "Le prix d'achat ne peut pas être négatif")
    .max(10000000, "Le prix d'achat est trop élevé"),
  priceResale: z
    .number()
    .min(0, "Le prix de revente ne peut pas être négatif")
    .max(10000000, "Le prix de revente est trop élevé")
    .optional()
    .nullable(),
  countryOrigin: z.string().max(50).default("DE"),
  coverImage: z.string().max(500).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  status: z.nativeEnum(VehicleStatus).default("AVAILABLE"),
  images: z.array(z.string()).default([]),
});

export type InventoryVehicleFormData = z.infer<typeof inventoryVehicleSchema>;

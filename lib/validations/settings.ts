import { z } from "zod";

export const globalSettingsSchema = z.object({
  regionPricePerCV: z
    .number()
    .min(0, "Le prix par CV ne peut pas être négatif")
    .max(500, "Valeur maximale dépassée"),
  defaultTransportCost: z
    .number()
    .min(0, "Le coût de transport ne peut pas être négatif")
    .max(100000),
  germanTempPlateCost: z
    .number()
    .min(0, "Le coût de la plaque ne peut pas être négatif")
    .max(10000),
});

export const cocPriceSchema = z.object({
  brand: z.string().min(1, "La marque est requise").max(100),
  price: z
    .number()
    .min(0, "Le prix ne peut pas être négatif")
    .max(10000, "Prix maximum dépassé"),
});

export type GlobalSettingsInput = z.infer<typeof globalSettingsSchema>;
export type CocPriceInput = z.infer<typeof cocPriceSchema>;

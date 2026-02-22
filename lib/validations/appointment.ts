import { z } from "zod";

const sanitizeString = (s: string) =>
  s.replace(/[<>]/g, "").trim().slice(0, 10000);

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const createAppointmentSchema = z.object({
  vehicleId: z.string().min(1, "Véhicule requis"),
  firstName: z
    .string()
    .min(1, "Le prénom est requis")
    .max(100)
    .transform(sanitizeString),
  lastName: z
    .string()
    .min(1, "Le nom est requis")
    .max(100)
    .transform(sanitizeString),
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  phone: z
    .string()
    .min(1, "Le téléphone est requis")
    .max(30)
    .transform((s) => s.replace(/\s/g, "").slice(0, 30)),
  date: z
    .string()
    .min(1, "La date est requise")
    .refine((s) => !Number.isNaN(Date.parse(s)), "Date invalide"),
  startTime: z.string().regex(timeRegex, "Heure de début invalide (HH:mm)"),
  endTime: z.string().regex(timeRegex, "Heure de fin invalide (HH:mm)"),
  message: z.string().max(2000).transform(sanitizeString).optional(),
});

export const createAppointmentSchemaLegacy = z.object({
  firstName: z.string().min(1).max(100).transform(sanitizeString),
  lastName: z.string().min(1).max(100).transform(sanitizeString),
  email: z.string().min(1).email(),
  phone: z.string().min(1).max(30).transform((s) => s.replace(/\s/g, "").slice(0, 30)),
  preferredDate: z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Date invalide"),
  preferredTime: z.string().max(50).transform(sanitizeString).optional(),
  message: z.string().max(2000).transform(sanitizeString).optional(),
});

export const updateAppointmentSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"])
    .optional(),
  adminNote: z.string().max(5000).transform(sanitizeString).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

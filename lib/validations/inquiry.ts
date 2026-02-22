import { z } from "zod";

const sanitizeString = (s: string) =>
  s.replace(/[<>]/g, "").trim().slice(0, 10000);

export const createInquirySchema = z.object({
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
  message: z
    .string()
    .min(1, "Le message est requis")
    .max(5000)
    .transform(sanitizeString),
});

export const updateInquirySchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "CLOSED"]).optional(),
  adminResponse: z.string().max(5000).transform(sanitizeString).optional(),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
export type UpdateInquiryInput = z.infer<typeof updateInquirySchema>;

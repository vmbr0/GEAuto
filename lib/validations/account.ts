import { z } from "zod";

const phoneRegex = /^[\d\s+\-.()]{8,30}$/;

export const updateAccountSchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email("Format d'email invalide").optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Au moins une majuscule, une minuscule et un chiffre"
      ),
    confirmNewPassword: z.string().min(1, "Confirmez le nouveau mot de passe"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmNewPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email requis").email("Format d'email invalide"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token requis"),
    newPassword: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Au moins une majuscule, une minuscule et un chiffre"
      ),
    confirmNewPassword: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmNewPassword"],
  });

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

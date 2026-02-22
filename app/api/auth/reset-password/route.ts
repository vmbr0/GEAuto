import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validations/account";
import { passwordResetService } from "@/services/password-reset-service";
import { getClientIp, isAuthRateLimited, recordAuthRequest } from "@/lib/rate-limit-public";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isAuthRateLimited(ip, "reset-password")) {
    return NextResponse.json(
      { error: "Trop de demandes. Réessayez dans 15 minutes." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return NextResponse.json(
        { error: first?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const userId = await passwordResetService.consumeToken(parsed.data.token);
    if (!userId) {
      return NextResponse.json(
        { error: "Lien invalide ou expiré. Demandez un nouveau lien." },
        { status: 400 }
      );
    }

    recordAuthRequest(ip, "reset-password");

    const hashed = await bcrypt.hash(parsed.data.newPassword, BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return NextResponse.json({ message: "Mot de passe réinitialisé. Vous pouvez vous connecter." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la réinitialisation" },
      { status: 500 }
    );
  }
}

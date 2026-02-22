import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/account";
import { passwordResetService } from "@/services/password-reset-service";
import { emailService } from "@/services/email-service";
import { getClientIp, isAuthRateLimited, recordAuthRequest } from "@/lib/rate-limit-public";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isAuthRateLimited(ip, "forgot-password")) {
    return NextResponse.json(
      { error: "Trop de demandes. Réessayez dans 15 minutes." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return NextResponse.json(
        { error: first?.message ?? "Email invalide" },
        { status: 400 }
      );
    }

    const result = await passwordResetService.createToken(parsed.data.email);
    recordAuthRequest(ip, "forgot-password");

    if (result) {
      const user = await prisma.user.findUnique({
        where: { id: result.userId },
        select: { email: true, firstName: true },
      });
      if (user) {
        emailService.sendPasswordReset({
          to: user.email,
          firstName: user.firstName ?? undefined,
          token: result.token,
        });
      }
    }

    return NextResponse.json({
      message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la demande" },
      { status: 500 }
    );
  }
}

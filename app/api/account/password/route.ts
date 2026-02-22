import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { accountService } from "@/services/account-service";
import { changePasswordSchema } from "@/lib/validations/account";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return NextResponse.json(
        { error: first?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    await accountService.changePassword(session.user.id, parsed.data);
    return NextResponse.json({ message: "Mot de passe mis à jour" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    if (message.includes("incorrect") || message.includes("sans mot de passe")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("Account password PUT error:", error);
    return NextResponse.json(
      { error: "Erreur lors du changement de mot de passe" },
      { status: 500 }
    );
  }
}

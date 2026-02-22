import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { accountService } from "@/services/account-service";
import { updateAccountSchema } from "@/lib/validations/account";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const profile = await accountService.getProfile(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: "Compte introuvable ou désactivé" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Account GET error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateAccountSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return NextResponse.json(
        { error: first?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const user = await accountService.updateProfile(session.user.id, parsed.data);
    if (!user) {
      return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    if (message.includes("déjà cet email")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("Account PUT error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}

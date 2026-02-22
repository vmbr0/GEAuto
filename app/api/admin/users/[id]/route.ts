import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { adminUsersService } from "@/services/admin-users-service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const user = await adminUsersService.getById(params.id);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("Admin users GET id error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { role, disabled, firstName, lastName, phone } = body;

    const updateData: { role?: UserRole; disabled?: boolean; firstName?: string; lastName?: string; phone?: string } = {};
    if (role !== undefined) {
      if (role !== "USER" && role !== "ADMIN") {
        return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
      }
      updateData.role = role as UserRole;
    }
    if (typeof disabled === "boolean") updateData.disabled = disabled;
    if (firstName !== undefined) updateData.firstName = String(firstName).slice(0, 50) || undefined;
    if (lastName !== undefined) updateData.lastName = String(lastName).slice(0, 50) || undefined;
    if (phone !== undefined) updateData.phone = String(phone).slice(0, 30) || undefined;

    const user = await adminUsersService.update(params.id, updateData);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Admin users PUT error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas désactiver votre propre compte" },
        { status: 400 }
      );
    }

    const user = await adminUsersService.softDelete(params.id);
    return NextResponse.json(user);
  } catch (error) {
    console.error("Admin users DELETE error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la désactivation" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { inquiryService } from "@/services/inquiry-service";
import { updateInquirySchema } from "@/lib/validations/inquiry";
import { emailService } from "@/services/email-service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const inquiry = await inquiryService.findById(params.id);
    if (!inquiry) {
      return NextResponse.json(
        { error: "Demande non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("Admin inquiry get error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const existing = await inquiryService.findById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: "Demande non trouvée" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = updateInquirySchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return NextResponse.json(
        { error: first?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const inquiry = await inquiryService.update(params.id, parsed.data);
    if (parsed.data.adminResponse) {
      emailService.sendAdminReplyToInquiry({
        to: inquiry.email,
        firstName: inquiry.firstName,
        lastName: inquiry.lastName,
        vehicleTitle: inquiry.vehicle.title,
        adminMessage: parsed.data.adminResponse,
      });
    }
    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("Admin inquiry update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

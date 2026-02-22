import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { UpdateAccountInput, ChangePasswordInput } from "@/lib/validations/account";

const BCRYPT_ROUNDS = 12;

export const accountService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, disabled: false },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        image: true,
        role: true,
        createdAt: true,
        lastActivityAt: true,
      },
    });
    if (!user) return null;

    const [appointments, inquiries] = await Promise.all([
      prisma.vehicleAppointment.findMany({
        where: { userId },
        orderBy: { preferredDate: "desc" },
        take: 50,
        include: {
          vehicle: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.vehicleInquiry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          vehicle: { select: { id: true, title: true, slug: true } },
        },
      }),
    ]);

    return {
      ...user,
      appointments,
      inquiries,
    };
  },

  async updateProfile(userId: string, data: UpdateAccountInput) {
    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    });
    if (!current) return null;

    const updateData: Record<string, unknown> = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName || null;
    if (data.lastName !== undefined) updateData.lastName = data.lastName || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.email !== undefined) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing && existing.id !== userId) {
        throw new Error("Un compte utilise déjà cet email");
      }
      updateData.email = data.email;
      const firstName = (data.firstName ?? current.firstName) ?? "";
      const lastName = (data.lastName ?? current.lastName) ?? "";
      updateData.name = [firstName, lastName].filter(Boolean).join(" ") || data.email;
    }
    updateData.lastActivityAt = new Date();

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData as any,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });
    return user;
  },

  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    if (!user?.password) {
      throw new Error("Compte sans mot de passe (connexion externe)");
    }
    const valid = await bcrypt.compare(data.currentPassword, user.password);
    if (!valid) {
      throw new Error("Mot de passe actuel incorrect");
    }
    const hashed = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed, lastActivityAt: new Date() },
    });
    return { ok: true };
  },

  async touchLastActivity(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastActivityAt: new Date() },
    });
  },
};

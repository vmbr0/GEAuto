import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

const BCRYPT_ROUNDS = 12;

export const adminUsersService = {
  async list(params: { search?: string; page?: number; pageSize?: number }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));
    const skip = (page - 1) * pageSize;

    const where: { OR?: Array<{ email?: { contains: string; mode: "insensitive" }; name?: { contains: string; mode: "insensitive" }; firstName?: { contains: string; mode: "insensitive" }; lastName?: { contains: string; mode: "insensitive" } }> } = {};
    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          disabled: true,
          createdAt: true,
          lastActivityAt: true,
          _count: {
            select: {
              vehicleAppointments: true,
              vehicleInquiries: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        disabled: true,
        createdAt: true,
        lastActivityAt: true,
        vehicleAppointments: {
          orderBy: { preferredDate: "desc" },
          take: 100,
          include: {
            vehicle: { select: { id: true, title: true, slug: true } },
          },
        },
        vehicleInquiries: {
          orderBy: { createdAt: "desc" },
          take: 100,
          include: {
            vehicle: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    });
    return user;
  },

  async update(
    id: string,
    data: { role?: UserRole; disabled?: boolean; firstName?: string; lastName?: string; phone?: string }
  ) {
    const updateData: Record<string, unknown> = {};
    if (data.role !== undefined) updateData.role = data.role;
    if (data.disabled !== undefined) updateData.disabled = data.disabled;
    if (data.firstName !== undefined) updateData.firstName = data.firstName || null;
    if (data.lastName !== undefined) updateData.lastName = data.lastName || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;

    const user = await prisma.user.update({
      where: { id },
      data: updateData as any,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        disabled: true,
      },
    });
    return user;
  },

  async softDelete(id: string) {
    return this.update(id, { disabled: true });
  },
};

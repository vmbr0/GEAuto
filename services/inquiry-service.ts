import { prisma } from "@/lib/prisma";
import { CreateInquiryInput, UpdateInquiryInput } from "@/lib/validations/inquiry";
import { InquiryStatus } from "@prisma/client";

export const inquiryService = {
  async create(params: {
    vehicleId: string;
    userId: string | null;
    data: CreateInquiryInput;
  }) {
    return prisma.vehicleInquiry.create({
      data: {
        vehicleId: params.vehicleId,
        userId: params.userId,
        firstName: params.data.firstName,
        lastName: params.data.lastName,
        email: params.data.email,
        phone: params.data.phone,
        message: params.data.message,
        status: "NEW",
      },
      include: {
        vehicle: { select: { id: true, title: true, slug: true } },
      },
    });
  },

  async findById(id: string) {
    return prisma.vehicleInquiry.findUnique({
      where: { id },
      include: {
        vehicle: { select: { id: true, title: true, slug: true, brand: true, model: true } },
        user: { select: { id: true, email: true, name: true } },
      },
    });
  },

  async listAdmin(params: {
    status?: InquiryStatus;
    page?: number;
    pageSize?: number;
    search?: string;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));
    const skip = (page - 1) * pageSize;

    const where: { status?: InquiryStatus; OR?: Array<{ email?: { contains: string; mode: "insensitive" }; firstName?: { contains: string; mode: "insensitive" }; lastName?: { contains: string; mode: "insensitive" } }> } = {};
    if (params.status) where.status = params.status;
    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { email: { contains: q, mode: "insensitive" } },
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.vehicleInquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          vehicle: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.vehicleInquiry.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async update(id: string, data: UpdateInquiryInput) {
    return prisma.vehicleInquiry.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status as InquiryStatus }),
        ...(data.adminResponse !== undefined && { adminResponse: data.adminResponse }),
      },
      include: {
        vehicle: { select: { id: true, title: true, slug: true } },
      },
    });
  },

  async countByVehicleId(vehicleId: string): Promise<number> {
    return prisma.vehicleInquiry.count({ where: { vehicleId } });
  },
};

import { prisma } from "@/lib/prisma";
import { CreateAppointmentInput, UpdateAppointmentInput } from "@/lib/validations/appointment";
import { AppointmentStatus } from "@prisma/client";
import { isSlotAvailable } from "./availability-service";

function parseDateOnly(dateStr: string): Date | null {
  const trimmed = dateStr?.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10) - 1;
    const d = parseInt(match[3], 10);
    const date = new Date(y, m, d);
    if (date.getFullYear() === y && date.getMonth() === m && date.getDate() === d) return date;
  }
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export const appointmentService = {
  async createWithSlot(params: {
    vehicleId: string;
    userId: string | null;
    date: string;
    startTime: string;
    endTime: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message?: string | null;
  }) {
    const date = parseDateOnly(params.date);
    if (!date || Number.isNaN(date.getTime())) {
      throw new Error("Date invalide.");
    }
    const available = await isSlotAvailable(date, params.startTime, params.endTime);
    if (!available) {
      throw new Error("Ce créneau n'est plus disponible.");
    }
    return prisma.vehicleAppointment.create({
      data: {
        vehicleId: params.vehicleId,
        userId: params.userId,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        phone: params.phone,
        preferredDate: date,
        startTime: params.startTime,
        endTime: params.endTime,
        message: params.message ?? null,
        status: "PENDING",
      },
      include: {
        vehicle: { select: { id: true, title: true, slug: true } },
      },
    });
  },

  async create(params: {
    vehicleId: string;
    userId: string | null;
    data: { preferredDate: string; preferredTime?: string; message?: string; firstName: string; lastName: string; email: string; phone: string };
  }) {
    const preferredDate = parseDateOnly(params.data.preferredDate) ?? new Date(params.data.preferredDate);
    if (Number.isNaN(preferredDate.getTime())) throw new Error("Date invalide.");
    return prisma.vehicleAppointment.create({
      data: {
        vehicleId: params.vehicleId,
        userId: params.userId,
        firstName: params.data.firstName,
        lastName: params.data.lastName,
        email: params.data.email,
        phone: params.data.phone,
        preferredDate,
        startTime: params.data.preferredTime ?? "09:00",
        endTime: params.data.preferredTime ?? "09:30",
        preferredTime: params.data.preferredTime ?? null,
        message: params.data.message ?? null,
        status: "PENDING",
      },
      include: {
        vehicle: { select: { id: true, title: true, slug: true } },
      },
    });
  },

  async findById(id: string) {
    return prisma.vehicleAppointment.findUnique({
      where: { id },
      include: {
        vehicle: { select: { id: true, title: true, slug: true, brand: true, model: true } },
        user: { select: { id: true, email: true, name: true } },
      },
    });
  },

  async listAdmin(params: {
    status?: AppointmentStatus;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    pageSize?: number;
    search?: string;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));
    const skip = (page - 1) * pageSize;

    const where: {
      status?: AppointmentStatus;
      preferredDate?: { gte?: Date; lte?: Date };
      OR?: Array<{ email?: { contains: string; mode: "insensitive" }; firstName?: { contains: string; mode: "insensitive" }; lastName?: { contains: string; mode: "insensitive" } }>;
    } = {};
    if (params.status) where.status = params.status;
    if (params.dateFrom || params.dateTo) {
      where.preferredDate = {};
      if (params.dateFrom) where.preferredDate.gte = params.dateFrom;
      if (params.dateTo) where.preferredDate.lte = params.dateTo;
    }
    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { email: { contains: q, mode: "insensitive" } },
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.vehicleAppointment.findMany({
        where,
        orderBy: [{ preferredDate: "asc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
        include: {
          vehicle: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.vehicleAppointment.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async update(id: string, data: UpdateAppointmentInput) {
    return prisma.vehicleAppointment.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status as AppointmentStatus }),
        ...(data.adminNote !== undefined && { adminNote: data.adminNote }),
      },
      include: {
        vehicle: { select: { id: true, title: true, slug: true } },
      },
    });
  },

  async countByVehicleId(vehicleId: string): Promise<number> {
    return prisma.vehicleAppointment.count({ where: { vehicleId } });
  },

  /**
   * List all appointments in a month, grouped by date (YYYY-MM-DD).
   * Optional filter by vehicleId.
   */
  async listByMonth(params: { month: string; vehicleId?: string }) {
    const [y, m] = params.month.split("-").map(Number);
    if (!y || !m || m < 1 || m > 12) return {};
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59, 999);

    const items = await prisma.vehicleAppointment.findMany({
      where: {
        preferredDate: { gte: start, lte: end },
        ...(params.vehicleId ? { vehicleId: params.vehicleId } : {}),
      },
      orderBy: [{ preferredDate: "asc" }, { startTime: "asc" }],
      include: {
        vehicle: { select: { id: true, title: true, slug: true } },
      },
    });

    const grouped: Record<string, typeof items> = {};
    items.forEach((a) => {
      const d = new Date(a.preferredDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(a);
    });
    return { month: params.month, days: grouped };
  },
};

import { prisma } from "@/lib/prisma";

/**
 * Parse "HH:mm" to minutes since midnight.
 */
function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * Minutes since midnight to "HH:mm".
 */
function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Get availability config for a weekday (0 = Sunday, ..., 6 = Saturday).
 * Returns null if the day has no config or is inactive.
 */
export async function getAvailabilityForWeekday(dayOfWeek: number) {
  const row = await prisma.availability.findUnique({
    where: { dayOfWeek },
  });
  return row?.isActive ? row : null;
}

/**
 * Check if a date is blocked.
 */
export async function isDateBlocked(date: Date): Promise<boolean> {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const blocked = await prisma.blockedDate.findUnique({
    where: { date: d },
  });
  return !!blocked;
}

/**
 * Generate time slots for a given date from availability config.
 * Returns array of { startTime, endTime } in "HH:mm" format.
 */
export async function getSlotsForDate(date: Date): Promise<{ startTime: string; endTime: string }[]> {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const availability = await getAvailabilityForWeekday(dayOfWeek);
  if (!availability) return [];

  const startMin = timeToMinutes(availability.startTime);
  const endMin = timeToMinutes(availability.endTime);
  const duration = availability.slotDuration;
  const slots: { startTime: string; endTime: string }[] = [];

  for (let min = startMin; min + duration <= endMin; min += duration) {
    slots.push({
      startTime: minutesToTime(min),
      endTime: minutesToTime(min + duration),
    });
  }
  return slots;
}

/**
 * Get all appointments for a given date that are not CANCELLED (so they block slots).
 */
export async function getBookedSlotsForDate(date: Date): Promise<{ startTime: string; endTime: string }[]> {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const next = new Date(d);
  next.setDate(next.getDate() + 1);

  const appointments = await prisma.vehicleAppointment.findMany({
    where: {
      preferredDate: { gte: d, lt: next },
      status: { not: "CANCELLED" },
      startTime: { not: null },
      endTime: { not: null },
    },
    select: { startTime: true, endTime: true },
  });

  return appointments
    .filter((a): a is { startTime: string; endTime: string } => a.startTime != null && a.endTime != null)
    .map((a) => ({ startTime: a.startTime, endTime: a.endTime }));
}

/**
 * Get available slots for a date: weekday availability + generated slots minus booked minus blocked.
 */
export async function getAvailableSlots(date: Date): Promise<{ startTime: string; endTime: string }[]> {
  if (await isDateBlocked(date)) return [];

  const allSlots = await getSlotsForDate(date);
  const booked = await getBookedSlotsForDate(date);
  const bookedSet = new Set(booked.map((b) => `${b.startTime}-${b.endTime}`));

  return allSlots.filter((s) => !bookedSet.has(`${s.startTime}-${s.endTime}`));
}

function slotsOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 < end2 && end1 > start2;
}

/**
 * Get availability summary for every day in a month (YYYY-MM).
 * Returns map of date string (YYYY-MM-DD) to { totalSlots, availableSlots, isClosed }.
 */
export async function getMonthAvailability(monthStr: string): Promise<
  Record<string, { totalSlots: number; availableSlots: number; isClosed: boolean }>
> {
  const [y, m] = monthStr.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return {};

  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const daysInMonth = last.getDate();

  const start = new Date(first);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(last);
  end.setUTCHours(23, 59, 59, 999);

  const [availabilityByWeekday, blockedDates, appointmentsInMonth] = await Promise.all([
    prisma.availability.findMany({ where: { isActive: true } }),
    prisma.blockedDate.findMany({
      where: { date: { gte: start, lte: end } },
      select: { date: true },
    }),
    prisma.vehicleAppointment.findMany({
      where: {
        preferredDate: { gte: start, lte: end },
        status: { not: "CANCELLED" },
        startTime: { not: null },
        endTime: { not: null },
      },
      select: { preferredDate: true, startTime: true, endTime: true },
    }),
  ]);

  const availMap: Record<number, { startTime: string; endTime: string; slotDuration: number }> = {};
  availabilityByWeekday.forEach((a) => {
    availMap[a.dayOfWeek] = {
      startTime: a.startTime,
      endTime: a.endTime,
      slotDuration: a.slotDuration,
    };
  });

  const blockedSet = new Set(
    blockedDates.map((b) => {
      const d = new Date(b.date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })
  );

  const bookedByDate: Record<string, Set<string>> = {};
  appointmentsInMonth.forEach((a) => {
    if (!a.startTime || !a.endTime) return;
    const d = new Date(a.preferredDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!bookedByDate[key]) bookedByDate[key] = new Set();
    bookedByDate[key].add(`${a.startTime}-${a.endTime}`);
  });

  const result: Record<string, { totalSlots: number; availableSlots: number; isClosed: boolean }> = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(y, m - 1, day);
    const dateKey = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayOfWeek = date.getDay();
    const config = availMap[dayOfWeek];

    if (blockedSet.has(dateKey) || !config) {
      result[dateKey] = { totalSlots: 0, availableSlots: 0, isClosed: true };
      continue;
    }

    const allSlots = getSlotsForDateFromConfig(config);
    const booked = bookedByDate[dateKey] ?? new Set();
    const availableSlots = allSlots.filter((s) => !booked.has(`${s.startTime}-${s.endTime}`)).length;

    result[dateKey] = {
      totalSlots: allSlots.length,
      availableSlots,
      isClosed: false,
    };
  }

  return result;
}

function getSlotsForDateFromConfig(config: {
  startTime: string;
  endTime: string;
  slotDuration: number;
}): { startTime: string; endTime: string }[] {
  const startMin = timeToMinutes(config.startTime);
  const endMin = timeToMinutes(config.endTime);
  const duration = config.slotDuration;
  const slots: { startTime: string; endTime: string }[] = [];
  for (let min = startMin; min + duration <= endMin; min += duration) {
    slots.push({
      startTime: minutesToTime(min),
      endTime: minutesToTime(min + duration),
    });
  }
  return slots;
}

/**
 * Check if a specific slot is still available (no overlapping appointment).
 */
export async function isSlotAvailable(
  date: Date,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Promise<boolean> {
  if (await isDateBlocked(date)) return false;

  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const next = new Date(d);
  next.setDate(next.getDate() + 1);

  const appointments = await prisma.vehicleAppointment.findMany({
    where: {
      preferredDate: { gte: d, lt: next },
      status: { not: "CANCELLED" },
      startTime: { not: null },
      endTime: { not: null },
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
    },
    select: { startTime: true, endTime: true },
  });

  const hasOverlap = appointments.some(
    (a) =>
      a.startTime != null &&
      a.endTime != null &&
      slotsOverlap(a.startTime, a.endTime, startTime, endTime)
  );
  return !hasOverlap;
}

import { prisma } from "@/lib/prisma";

const PREFIX_VEHICLE = "GE";
const PREFIX_PARTS = "GE-P";
const PREFIX_INQUIRY = "GE-INQ";

function extractSeq(dossierNumber: string | null): number {
  if (!dossierNumber) return 0;
  const parts = dossierNumber.split("-");
  const last = parts[parts.length - 1];
  const n = parseInt(last ?? "0", 10);
  return Number.isNaN(n) ? 0 : n;
}

export async function getNextVehicleDossierNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `${PREFIX_VEHICLE}-${year}-`;
  const existing = await prisma.vehicleRequest.findMany({
    where: { dossierNumber: { startsWith: prefix } },
    select: { dossierNumber: true },
  });
  const max = Math.max(0, ...existing.map((r) => extractSeq(r.dossierNumber)));
  return `${prefix}${String(max + 1).padStart(6, "0")}`;
}

export async function getNextPartsDossierNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `${PREFIX_PARTS}-${year}-`;
  const existing = await prisma.partsRequest.findMany({
    where: { dossierNumber: { startsWith: prefix } },
    select: { dossierNumber: true },
  });
  const max = Math.max(0, ...existing.map((r) => extractSeq(r.dossierNumber)));
  return `${prefix}${String(max + 1).padStart(6, "0")}`;
}

export async function getNextInquiryDossierNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `${PREFIX_INQUIRY}-${year}-`;
  const existing = await prisma.vehicleInquiry.findMany({
    where: { dossierNumber: { startsWith: prefix } },
    select: { dossierNumber: true },
  });
  const max = Math.max(0, ...existing.map((r) => extractSeq(r.dossierNumber)));
  return `${prefix}${String(max + 1).padStart(6, "0")}`;
}

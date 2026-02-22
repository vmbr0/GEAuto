import { requireRole } from "@/lib/auth-helpers";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate, formatPrice } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Car, Package } from "lucide-react";

export default async function AdminRequestsPage() {
  await requireRole(UserRole.ADMIN);

  const [vehicleRequests, partsRequests] = await Promise.all([
    prisma.vehicleRequest.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.partsRequest.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const allRequests = [
    ...vehicleRequests.map((r) => ({ ...r, type: "vehicle" as const })),
    ...partsRequests.map((r) => ({ ...r, type: "parts" as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <header className="mb-10">
        <p className="text-sm text-[#6B7280] mb-1">Admin</p>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-2">
          Gestion des demandes
        </h1>
        <p className="text-[#9AA4B2]">
          Gérez toutes les demandes de véhicules et de pièces
        </p>
      </header>

      <Card variant="dark" className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHead className="border-b border-[rgba(255,255,255,0.06)] bg-[#151922]">
              <TableRow>
                <TableHeader className="text-[#9AA4B2]">Type</TableHeader>
                <TableHeader className="text-[#9AA4B2]">Client</TableHeader>
                <TableHeader className="text-[#9AA4B2]">Détails</TableHeader>
                <TableHeader className="text-[#9AA4B2]">Budget</TableHeader>
                <TableHeader className="text-[#9AA4B2]">Statut</TableHeader>
                <TableHeader className="text-[#9AA4B2]">Date</TableHeader>
                <TableHeader className="text-[#9AA4B2]">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y divide-[rgba(255,255,255,0.06)]">
              {allRequests.map((request) => (
                <TableRow
                  key={request.id}
                  className="hover:bg-[rgba(255,255,255,0.03)]"
                >
                  <TableCell className="text-[#F5F5F5]">
                    <div className="flex items-center gap-2">
                      {request.type === "vehicle" ? (
                        <Car className="w-5 h-5 text-[#9AA4B2]" />
                      ) : (
                        <Package className="w-5 h-5 text-[#9AA4B2]" />
                      )}
                      <span className="capitalize">
                        {request.type === "vehicle" ? "Véhicule" : "Pièce"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#F5F5F5]">
                    <div>
                      <p className="font-medium">
                        {request.user.name || request.user.email}
                      </p>
                      <p className="text-sm text-[#9AA4B2]">
                        {request.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#F5F5F5]">
                    <div className="max-w-xs">
                      <p className="font-medium truncate">
                        {request.type === "vehicle"
                          ? `${(request as any).brand} ${(request as any).model}`
                          : (request as any).partName}
                      </p>
                      {request.type === "vehicle" &&
                        (request as any).yearMin &&
                        (request as any).yearMax && (
                          <p className="text-sm text-[#9AA4B2]">
                            {(request as any).yearMin} -{" "}
                            {(request as any).yearMax}
                          </p>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-[#9AA4B2]">
                    {(request as any).budget
                      ? formatPrice((request as any).budget)
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} dark />
                  </TableCell>
                  <TableCell className="text-[#9AA4B2]">
                    {formatDate(request.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/requests/${request.type}/${request.id}`}
                      className="text-[#F5F5F5] hover:text-[#9AA4B2] text-sm font-medium transition-colors"
                    >
                      Gérer →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

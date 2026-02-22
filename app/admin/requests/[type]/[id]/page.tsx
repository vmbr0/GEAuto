import { requireRole } from "@/lib/auth-helpers";
import { UserRole, RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate, formatPrice } from "@/lib/utils";
import RequestManagement from "@/components/admin/RequestManagement";
import { Car, Package } from "lucide-react";

interface PageProps {
  params: {
    type: string;
    id: string;
  };
}

export default async function AdminRequestDetailPage({ params }: PageProps) {
  await requireRole(UserRole.ADMIN);

  const { type, id } = params;

  let request: any = null;
  let scrapedItems: any[] = [];

  if (type === "vehicle") {
    request = await prisma.vehicleRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        scrapedVehicles: {
          orderBy: { scrapedAt: "desc" },
        },
        vehicleMessages: {
          include: {
            sender: {
              select: {
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (request) {
      scrapedItems = request.scrapedVehicles;
    }
  } else if (type === "parts") {
    request = await prisma.partsRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        scrapedParts: {
          orderBy: { scrapedAt: "desc" },
        },
        partsMessages: {
          include: {
            sender: {
              select: {
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (request) {
      scrapedItems = request.scrapedParts;
    }
  }

  if (!request) {
    notFound();
  }

  return (
    <div>
      <header className="mb-10">
        <p className="text-sm text-[#6B7280] mb-1">Admin</p>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-2">
          Gestion de la demande
        </h1>
        <p className="text-[#9AA4B2]">
          Client: {request.user.name || request.user.email}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="dark">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-lg bg-[#151922] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                {type === "vehicle" ? (
                  <Car className="w-8 h-8 text-[#9AA4B2]" />
                ) : (
                  <Package className="w-8 h-8 text-[#9AA4B2]" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-[#F5F5F5]">
                    {type === "vehicle"
                      ? `${request.brand} ${request.model}`
                      : request.partName}
                  </h2>
                  <StatusBadge status={request.status} dark />
                </div>
                <p className="text-sm text-[#9AA4B2]">
                  Créé le {formatDate(request.createdAt)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[rgba(255,255,255,0.06)]">
              {type === "vehicle" ? (
                <>
                  {request.yearMin && request.yearMax && (
                    <div>
                      <p className="text-sm text-[#9AA4B2] mb-1">Année</p>
                      <p className="font-semibold text-[#F5F5F5]">
                        {request.yearMin} - {request.yearMax}
                      </p>
                    </div>
                  )}
                  {request.mileageMin && request.mileageMax && (
                    <div>
                      <p className="text-sm text-[#9AA4B2] mb-1">Kilométrage</p>
                      <p className="font-semibold text-[#F5F5F5]">
                        {request.mileageMin.toLocaleString()} -{" "}
                        {request.mileageMax.toLocaleString()} km
                      </p>
                    </div>
                  )}
                  {request.fuelType && (
                    <div>
                      <p className="text-sm text-[#9AA4B2] mb-1">Carburant</p>
                      <p className="font-semibold text-[#F5F5F5]">
                        {request.fuelType === "PETROL"
                          ? "Essence"
                          : request.fuelType === "DIESEL"
                          ? "Diesel"
                          : request.fuelType === "ELECTRIC"
                          ? "Électrique"
                          : request.fuelType === "HYBRID"
                          ? "Hybride"
                          : "Hybride rechargeable"}
                      </p>
                    </div>
                  )}
                  {request.transmission && (
                    <div>
                      <p className="text-sm text-[#9AA4B2] mb-1">Transmission</p>
                      <p className="font-semibold text-[#F5F5F5]">
                        {request.transmission === "MANUAL"
                          ? "Manuelle"
                          : request.transmission === "AUTOMATIC"
                          ? "Automatique"
                          : "CVT"}
                      </p>
                    </div>
                  )}
                  {request.color && (
                    <div>
                      <p className="text-sm text-[#9AA4B2] mb-1">Couleur</p>
                      <p className="font-semibold text-[#F5F5F5]">{request.color}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {request.vehicleModel && (
                    <div>
                      <p className="text-sm text-[#9AA4B2] mb-1">Modèle véhicule</p>
                      <p className="font-semibold text-[#F5F5F5]">{request.vehicleModel}</p>
                    </div>
                  )}
                  {request.year && (
                    <div>
                      <p className="text-sm text-[#9AA4B2] mb-1">Année</p>
                      <p className="font-semibold text-[#F5F5F5]">{request.year}</p>
                    </div>
                  )}
                  {request.vin && (
                    <div className="col-span-2">
                      <p className="text-sm text-[#9AA4B2] mb-1">VIN</p>
                      <p className="font-semibold text-[#F5F5F5]">{request.vin}</p>
                    </div>
                  )}
                </>
              )}
              {request.budget && (
                <div>
                  <p className="text-sm text-[#9AA4B2] mb-1">Budget</p>
                  <p className="font-semibold text-[#F5F5F5]">{formatPrice(request.budget)}</p>
                </div>
              )}
            </div>

            {request.notes && (
              <div className="pt-6 border-t border-[rgba(255,255,255,0.06)] mt-6">
                <p className="text-sm text-[#9AA4B2] mb-2">Notes</p>
                <p className="text-[#F5F5F5] whitespace-pre-wrap">{request.notes}</p>
              </div>
            )}
          </Card>

          <RequestManagement request={request} requestType={type} />

          {scrapedItems.length > 0 && (
            <Card variant="dark">
              <h3 className="text-xl font-bold mb-4 text-[#F5F5F5]">
                Résultats trouvés ({scrapedItems.length})
              </h3>
              <div className="space-y-4">
                {scrapedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-[rgba(255,255,255,0.06)] rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-[#F5F5F5]">{item.title}</h4>
                      {item.price && (
                        <span className="text-lg font-bold text-[#F5F5F5]">{formatPrice(item.price)}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-[#9AA4B2] mb-3">
                      {type === "vehicle" && item.mileage && (
                        <span>{item.mileage.toLocaleString()} km</span>
                      )}
                      {type === "vehicle" && item.location && (
                        <span>{item.location}</span>
                      )}
                      {type === "parts" && item.seller && <span>{item.seller}</span>}
                      <span>{formatDate(item.scrapedAt)}</span>
                    </div>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#F5F5F5] hover:text-[#9AA4B2] text-sm font-medium transition-colors"
                    >
                      Voir l'annonce →
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card variant="dark">
            <h3 className="text-lg font-bold mb-4 text-[#F5F5F5]">Client</h3>
            <div>
              <p className="font-semibold text-[#F5F5F5]">{request.user.name || "Non renseigné"}</p>
              <p className="text-sm text-[#9AA4B2]">{request.user.email}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate, formatPrice } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Car, Package, MessageSquare, Calendar } from "lucide-react";

interface PageProps {
  params: {
    type: string;
    id: string;
  };
}

export default async function RequestDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { type, id } = params;

  let request: any = null;
  let scrapedItems: any[] = [];

  if (type === "vehicle") {
    request = await prisma.vehicleRequest.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
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
    request = await prisma.partsRequest.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
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

  const statusHistory = [
    { status: "PENDING", label: "En attente", date: request.createdAt },
    ...(request.status !== "PENDING"
      ? [
          {
            status: request.status,
            label:
              request.status === "SEARCHING"
                ? "Recherche en cours"
                : request.status === "FOUND"
                ? "Trouvé"
                : request.status === "QUOTED"
                ? "Devis envoyé"
                : request.status === "COMPLETED"
                ? "Terminé"
                : "Annulé",
            date: request.updatedAt,
          },
        ]
      : []),
  ];

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
          Détails de la demande
        </h1>
        <p className="text-[var(--text-secondary)]">
          Suivez l'avancement et communiquez avec notre équipe
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="dark">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-lg bg-[var(--hover-surface)] border border-[var(--border-subtle)] flex items-center justify-center">
                {type === "vehicle" ? (
                  <Car className="w-8 h-8 text-[var(--text-secondary)]" />
                ) : (
                  <Package className="w-8 h-8 text-[var(--text-secondary)]" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    {type === "vehicle"
                      ? `${request.brand} ${request.model}`
                      : request.partName}
                  </h2>
                  <StatusBadge status={request.status} dark />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Créé le {formatDate(request.createdAt)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[var(--border-subtle)]">
              {type === "vehicle" ? (
                <>
                  {request.yearMin && request.yearMax && (
                    <div>
                      <p className="text-sm text-[var(--text-secondary)] mb-1">Année</p>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {request.yearMin} - {request.yearMax}
                      </p>
                    </div>
                  )}
                  {request.mileageMin && request.mileageMax && (
                    <div>
                      <p className="text-sm text-[var(--text-secondary)] mb-1">Kilométrage</p>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {request.mileageMin.toLocaleString()} -{" "}
                        {request.mileageMax.toLocaleString()} km
                      </p>
                    </div>
                  )}
                  {request.fuelType && (
                    <div>
                      <p className="text-sm text-[var(--text-secondary)] mb-1">Carburant</p>
                      <p className="font-semibold text-[var(--text-primary)]">
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
                      <p className="text-sm text-[var(--text-secondary)] mb-1">Transmission</p>
                      <p className="font-semibold text-[var(--text-primary)]">
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
                      <p className="text-sm text-[var(--text-secondary)] mb-1">Couleur</p>
                      <p className="font-semibold text-[var(--text-primary)]">{request.color}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {request.vehicleModel && (
                    <div>
                      <p className="text-sm text-[var(--text-secondary)] mb-1">Modèle véhicule</p>
                      <p className="font-semibold text-[var(--text-primary)]">{request.vehicleModel}</p>
                    </div>
                  )}
                  {request.year && (
                    <div>
                      <p className="text-sm text-[var(--text-secondary)] mb-1">Année</p>
                      <p className="font-semibold text-[var(--text-primary)]">{request.year}</p>
                    </div>
                  )}
                  {request.vin && (
                    <div className="col-span-2">
                      <p className="text-sm text-[var(--text-secondary)] mb-1">VIN</p>
                      <p className="font-semibold text-[var(--text-primary)]">{request.vin}</p>
                    </div>
                  )}
                </>
              )}
              {request.budget && (
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Budget</p>
                  <p className="font-semibold text-[var(--text-primary)]">{formatPrice(request.budget)}</p>
                </div>
              )}
            </div>

            {request.notes && (
              <div className="pt-6 border-t border-[var(--border-subtle)] mt-6">
                <p className="text-sm text-[var(--text-secondary)] mb-2">Notes</p>
                <p className="text-[var(--text-primary)] whitespace-pre-wrap">{request.notes}</p>
              </div>
            )}
          </Card>

          {scrapedItems.length > 0 && (
            <Card variant="dark">
              <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
                Résultats trouvés ({scrapedItems.length})
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHead className="border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                    <TableRow>
                      <TableHeader className="text-[var(--text-secondary)]">Titre</TableHeader>
                      <TableHeader className="text-[var(--text-secondary)]">Prix</TableHeader>
                      {type === "vehicle" && <TableHeader className="text-[var(--text-secondary)]">Kilométrage</TableHeader>}
                      {type === "vehicle" && <TableHeader className="text-[var(--text-secondary)]">Localisation</TableHeader>}
                      {type === "parts" && <TableHeader className="text-[var(--text-secondary)]">Vendeur</TableHeader>}
                      <TableHeader className="text-[var(--text-secondary)]">Date</TableHeader>
                      <TableHeader className="text-[var(--text-secondary)]">Lien</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody className="divide-[var(--border-subtle)]">
                    {scrapedItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-[var(--hover-surface)]">
                        <TableCell className="max-w-xs truncate text-[var(--text-primary)]">{item.title}</TableCell>
                        <TableCell className="text-[var(--text-secondary)]">
                          {item.price ? formatPrice(item.price) : "N/A"}
                        </TableCell>
                        {type === "vehicle" && (
                          <>
                            <TableCell className="text-[var(--text-secondary)]">
                              {item.mileage ? `${item.mileage.toLocaleString()} km` : "N/A"}
                            </TableCell>
                            <TableCell className="text-[var(--text-secondary)]">{item.location || "N/A"}</TableCell>
                          </>
                        )}
                        {type === "parts" && (
                          <TableCell className="text-[var(--text-secondary)]">{item.seller || "N/A"}</TableCell>
                        )}
                        <TableCell className="text-[var(--text-secondary)]">{formatDate(item.scrapedAt)}</TableCell>
                        <TableCell>
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] hover:text-[var(--text-secondary)]">
                            Voir →
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}

          <Card variant="dark">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
              <MessageSquare className="w-5 h-5 text-[var(--text-secondary)]" />
              Messages ({(type === "vehicle" ? request.vehicleMessages : request.partsMessages).length})
            </h3>
            {(type === "vehicle" ? request.vehicleMessages : request.partsMessages).length === 0 ? (
              <p className="text-[var(--text-secondary)]">Aucun message pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {(type === "vehicle" ? request.vehicleMessages : request.partsMessages).map((message: any) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border ${
                      message.sender.role === "ADMIN"
                        ? "bg-[var(--hover-surface)] border-[var(--border-subtle)]"
                        : "bg-[var(--bg-elevated)]/50 border-[var(--border-subtle)]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">
                          {message.sender.name || message.sender.email}
                          {message.sender.role === "ADMIN" && (
                            <span className="ml-2 text-xs bg-[var(--hover-surface)] text-[var(--text-secondary)] px-2 py-1 rounded border border-[var(--border-subtle)]">
                              Admin
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {formatDate(message.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-[var(--text-primary)] whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="dark">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
              <Calendar className="w-5 h-5 text-[var(--text-secondary)]" />
              Historique
            </h3>
            <div className="space-y-4">
              {statusHistory.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === statusHistory.length - 1 ? "bg-[var(--text-primary)]" : "bg-[var(--text-muted)]"
                      }`}
                    />
                    {index < statusHistory.length - 1 && (
                      <div className="w-0.5 h-8 bg-[var(--border-subtle)] mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-sm text-[var(--text-primary)]">{item.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatDate(item.date as Date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

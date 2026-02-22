import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import Image from "next/image";
import { Calendar, MapPin, Gauge, Euro, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ScrapeResultDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/auth/login");
  }

  const searchSession = await prisma.searchSession.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      scrapedVehicles: {
        orderBy: {
          scrapedAt: "desc",
        },
      },
    },
  });

  if (!searchSession) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/scrape-results"
          className="inline-flex items-center gap-2 text-[#9AA4B2] hover:text-[#F5F5F5] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux résultats
        </Link>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-2">
          Résultats: {searchSession.brand} {searchSession.model}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-[#9AA4B2]">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(new Date(searchSession.createdAt), "PPP 'à' HH:mm", {
              locale: fr,
            })}
          </div>
          <div>
            Par: {searchSession.user.name || searchSession.user.email}
          </div>
          <div>
            {searchSession.resultCount} résultat
            {searchSession.resultCount > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <Card variant="dark" className="mb-6">
        <h2 className="text-lg font-semibold mb-4 text-[#F5F5F5]">Critères de recherche</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {searchSession.year && (
            <div>
              <div className="text-sm text-[#9AA4B2]">Année</div>
              <div className="font-semibold text-[#F5F5F5]">{searchSession.year}</div>
            </div>
          )}
          {searchSession.mileage && (
            <div>
              <div className="text-sm text-[#9AA4B2]">Kilométrage max</div>
              <div className="font-semibold">
                {searchSession.mileage.toLocaleString()} km
              </div>
            </div>
          )}
          {searchSession.fuelType && (
            <div>
              <div className="text-sm text-[#9AA4B2]">Carburant</div>
              <div className="font-semibold text-[#F5F5F5]">
                {searchSession.fuelType === "PETROL"
                  ? "Essence"
                  : searchSession.fuelType === "DIESEL"
                  ? "Diesel"
                  : searchSession.fuelType === "ELECTRIC"
                  ? "Électrique"
                  : searchSession.fuelType === "HYBRID"
                  ? "Hybride"
                  : "Hybride rechargeable"}
              </div>
            </div>
          )}
          {searchSession.transmission && (
            <div>
              <div className="text-sm text-[#9AA4B2]">Boîte de vitesse</div>
              <div className="font-semibold text-[#F5F5F5]">
                {searchSession.transmission === "MANUAL"
                  ? "Manuelle"
                  : searchSession.transmission === "AUTOMATIC"
                  ? "Automatique"
                  : "CVT"}
              </div>
            </div>
          )}
        </div>
      </Card>

      {searchSession.scrapedVehicles.length === 0 ? (
        <Card variant="dark">
          <div className="text-center py-12">
            <p className="text-[#9AA4B2]">
              Aucun résultat trouvé pour cette recherche.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {searchSession.scrapedVehicles.map((vehicle) => (
            <Card key={vehicle.id} variant="dark">
              <div className="flex flex-col md:flex-row gap-6">
                {vehicle.images.length > 0 && (
                  <div className="md:w-64 flex-shrink-0">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#151922]">
                      <Image
                        src={vehicle.images[0]}
                        alt={vehicle.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3 text-[#F5F5F5]">{vehicle.title}</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {vehicle.price && (
                      <div className="flex items-center gap-2">
                        <Euro className="w-4 h-4 text-[#9AA4B2]" />
                        <div>
                          <div className="text-sm text-[#9AA4B2]">Prix</div>
                          <div className="font-semibold text-[#F5F5F5]">
                            {vehicle.price.toLocaleString()} €
                          </div>
                        </div>
                      </div>
                    )}
                    {vehicle.mileage && (
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-[#9AA4B2]" />
                        <div>
                          <div className="text-sm text-[#9AA4B2]">Kilométrage</div>
                          <div className="font-semibold text-[#F5F5F5]">
                            {vehicle.mileage.toLocaleString()} km
                          </div>
                        </div>
                      </div>
                    )}
                    {vehicle.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#9AA4B2]" />
                        <div>
                          <div className="text-sm text-[#9AA4B2]">Localisation</div>
                          <div className="font-semibold text-[#F5F5F5]">{vehicle.location}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#9AA4B2]" />
                      <div>
                        <div className="text-sm text-[#9AA4B2]">Scrapé le</div>
                        <div className="font-semibold text-sm text-[#F5F5F5]">
                          {format(new Date(vehicle.scrapedAt), "dd/MM/yyyy", {
                            locale: fr,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {vehicle.images.length > 1 && (
                    <div className="flex gap-2 mb-4">
                      {vehicle.images.slice(1, 4).map((img, idx) => (
                        <div
                          key={idx}
                          className="relative w-20 h-20 rounded overflow-hidden bg-[#151922]"
                        >
                          <Image
                            src={img}
                            alt={`${vehicle.title} - Image ${idx + 2}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Link */}
                  <a
                    href={vehicle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#F5F5F5] hover:text-[#9AA4B2] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir sur mobile.de
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

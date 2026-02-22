import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import Link from "next/link";
import { Search, Calendar, Car } from "lucide-react";
import Button from "@/components/ui/Button";

export default async function ScrapeResultsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/auth/login");
  }

  const searchSessions = await prisma.searchSession.findMany({
    where: {
      searchType: "vehicle",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          scrapedVehicles: true,
        },
      },
    },
    take: 50,
  });

  return (
    <div>
      <header className="mb-10">
        <p className="text-sm text-[#6B7280] mb-1">Admin</p>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-2">
          Résultats de scraping
        </h1>
        <p className="text-[#9AA4B2]">
          Consultez toutes les recherches effectuées sur mobile.de
        </p>
      </header>

      {searchSessions.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#111318] backdrop-blur-sm p-12 text-center">
          <Search className="w-16 h-16 mx-auto text-[#6B7280] mb-4" />
          <h3 className="text-xl font-semibold text-[#F5F5F5] mb-2">
            Aucune recherche effectuée
          </h3>
          <p className="text-[#9AA4B2] mb-6">
            Les résultats de scraping apparaîtront ici une fois que vous aurez
            effectué des recherches.
          </p>
          <Link href="/admin/search/vehicle">
            <Button variant="primary">Effectuer une recherche</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {searchSessions.map((searchSession) => (
            <Link
              key={searchSession.id}
              href={`/admin/scrape-results/${searchSession.id}`}
            >
              <div className="rounded-2xl border border-white/5 bg-[#111318] backdrop-blur-sm p-6 hover:border-white/10 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Car className="w-5 h-5 text-[#9AA4B2]" />
                      <h3 className="text-xl font-semibold text-[#F5F5F5]">
                        {searchSession.brand} {searchSession.model}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-[#9AA4B2] mb-3">
                      {searchSession.year && (
                        <span>Année: {searchSession.year}</span>
                      )}
                      {searchSession.mileage && (
                        <span>Km max: {searchSession.mileage.toLocaleString()}</span>
                      )}
                      {searchSession.fuelType && (
                        <span>
                          Carburant:{" "}
                          {searchSession.fuelType === "PETROL"
                            ? "Essence"
                            : searchSession.fuelType === "DIESEL"
                            ? "Diesel"
                            : searchSession.fuelType === "ELECTRIC"
                            ? "Électrique"
                            : searchSession.fuelType === "HYBRID"
                            ? "Hybride"
                            : "Hybride rechargeable"}
                        </span>
                      )}
                      {searchSession.transmission && (
                        <span>
                          Boîte:{" "}
                          {searchSession.transmission === "MANUAL"
                            ? "Manuelle"
                            : searchSession.transmission === "AUTOMATIC"
                            ? "Automatique"
                            : "CVT"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(searchSession.createdAt), "PPP", {
                          locale: fr,
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Search className="w-4 h-4" />
                        {searchSession._count.scrapedVehicles} résultat
                        {searchSession._count.scrapedVehicles > 1 ? "s" : ""}
                      </div>
                      <div>
                        Par: {searchSession.user.name || searchSession.user.email}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 text-right">
                    <div className="text-2xl font-bold text-[#F5F5F5]">
                      {searchSession.resultCount}
                    </div>
                    <div className="text-xs text-[#6B7280]">résultats</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

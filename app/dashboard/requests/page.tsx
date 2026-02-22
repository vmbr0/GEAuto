import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate, formatPrice } from "@/lib/utils";
import { Car, Package } from "lucide-react";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";
import Button from "@/components/ui/Button";

export default async function RequestsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [vehicleRequests, partsRequests] = await Promise.all([
    prisma.vehicleRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.partsRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const allRequests = [
    ...vehicleRequests.map((r) => ({ ...r, type: "vehicle" as const })),
    ...partsRequests.map((r) => ({ ...r, type: "parts" as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-2">
          Mes demandes
        </h1>
        <p className="text-[#B8B8B8]">
          Suivez l&apos;état de toutes vos demandes de véhicules et de pièces
        </p>
      </div>

      {allRequests.length === 0 ? (
        <DashboardEmptyState
          iconName="car"
          title="Aucune demande"
          description="Vous n'avez pas encore de demandes. Créez une demande de véhicule ou de pièces pour commencer."
          action={
            <>
              <Link href="/request/vehicle">
                <Button variant="primary" className="w-full sm:w-auto">
                  Demander un véhicule
                </Button>
              </Link>
              <Link href="/request/parts">
                <Button variant="outline" className="w-full sm:w-auto">
                  Demander des pièces
                </Button>
              </Link>
            </>
          }
        />
      ) : (
        <div className="space-y-6">
          {allRequests.map((request) => (
            <Link
              key={request.id}
              href={`/dashboard/requests/${request.type}/${request.id}`}
            >
              <Card variant="dark" hover className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-[var(--hover-surface)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                      {request.type === "vehicle" ? (
                        <Car className="w-6 h-6 text-[#B8B8B8]" />
                      ) : (
                        <Package className="w-6 h-6 text-[#B8B8B8]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-[#F5F5F5]">
                          {request.type === "vehicle"
                            ? `${(request as any).brand} ${(request as any).model}`
                            : (request as any).partName}
                        </h3>
                        <StatusBadge status={request.status} dark />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#B8B8B8]">
                        <span>
                          {request.type === "vehicle" ? "Véhicule" : "Pièce"}
                        </span>
                        <span>Créé le {formatDate(request.createdAt)}</span>
                        {(request as any).budget && (
                          <span>
                            Budget: {formatPrice((request as any).budget)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-[#8A8F98] shrink-0">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

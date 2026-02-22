import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { Package } from "lucide-react";
import Button from "@/components/ui/Button";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";

export default async function DashboardPartsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const partsRequests = await prisma.partsRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-2">
            Pièces
          </h1>
          <p className="text-[#B8B8B8]">
            Vos demandes de pièces automobiles
          </p>
        </div>
        <Link href="/request/parts">
          <Button variant="primary">
            <Package className="w-5 h-5 mr-2" />
            Nouvelle demande de pièces
          </Button>
        </Link>
      </div>

      {partsRequests.length === 0 ? (
        <DashboardEmptyState
          iconName="package"
          title="Aucune demande de pièces"
          description="Créez une demande pour rechercher des pièces automobiles en Europe."
          action={
            <Link href="/request/parts">
              <Button variant="primary">Demander des pièces</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {partsRequests.map((request) => (
            <Link
              key={request.id}
              href={`/dashboard/requests/parts/${request.id}`}
            >
              <Card variant="dark" hover className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-[var(--hover-surface)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-[#B8B8B8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-[#F5F5F5]">
                          {request.partName}
                        </h3>
                        <StatusBadge status={request.status} dark />
                      </div>
                      {(request.vehicleModel || request.year) && (
                        <p className="text-sm text-[#B8B8B8] mb-1">
                          {[request.vehicleModel, request.year]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      )}
                      <p className="text-sm text-[#8A8F98]">
                        Créé le {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-[#8A8F98] shrink-0 ml-2"
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
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

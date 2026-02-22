import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { Car, Package, User } from "lucide-react";
import DashboardKPIGrid from "@/components/dashboard/DashboardKPIGrid";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  let vehicleRequests = 0;
  let partsRequests = 0;
  let recentRequests: Awaited<ReturnType<typeof prisma.vehicleRequest.findMany>> = [];
  let dbError = false;

  try {
    [vehicleRequests, partsRequests, recentRequests] = await Promise.all([
      prisma.vehicleRequest.count({
        where: { userId: user.id },
      }),
      prisma.partsRequest.count({
        where: { userId: user.id },
      }),
      prisma.vehicleRequest.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          vehicleMessages: {
            where: { isRead: false },
            select: { id: true },
          },
        },
      }),
    ]);
  } catch (e) {
    dbError = true;
  }

  const totalRequests = vehicleRequests + partsRequests;

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
          Tableau de bord
        </h1>
        <p className="text-[var(--text-secondary)]">
          Bienvenue, {user.firstName || user.name || user.email}
        </p>
      </div>

      {dbError && (
        <Card variant="dark" className="mb-8 border-amber-500/50 bg-amber-500/10">
          <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
            Base de données indisponible
          </p>
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            À la racine du projet, exécutez :{" "}
            <code className="bg-[var(--hover-surface)] px-2 py-0.5 rounded text-xs">
              .\scripts\start-db.ps1
            </code>
            {" "}ou{" "}
            <code className="bg-[var(--hover-surface)] px-2 py-0.5 rounded text-xs">
              docker-compose up -d postgres redis
            </code>
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Si Docker ne démarre pas, voir <strong>DOCKER.md</strong> (section Dépannage) pour utiliser PostgreSQL en local.
          </p>
        </Card>
      )}

      {/* KPI Section - Premium glass cards with animated counters */}
      <div className="mb-10">
        <DashboardKPIGrid
          totalRequests={totalRequests}
          vehicleRequests={vehicleRequests}
          partsRequests={partsRequests}
          recentCount={recentRequests.length}
        />
      </div>

      {/* Quick Actions - keep existing blocks, dark variant for consistency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/account">
          <Card variant="dark" hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[var(--hover-surface)] border border-[var(--border-subtle)] flex items-center justify-center">
                <User className="w-8 h-8 text-[var(--text-secondary)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 text-[var(--text-primary)]">
                  Mon compte
                </h3>
                <p className="text-[var(--text-secondary)]">
                  Profil, mot de passe, rendez-vous et demandes d&apos;info
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/request/vehicle">
          <Card variant="dark" hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[var(--hover-surface)] border border-[var(--border-subtle)] flex items-center justify-center">
                <Car className="w-8 h-8 text-[var(--text-secondary)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 text-[var(--text-primary)]">
                  Demander un véhicule
                </h3>
                <p className="text-[var(--text-secondary)]">
                  Créez une nouvelle demande d&apos;import
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/request/parts">
          <Card variant="dark" hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[var(--hover-surface)] border border-[var(--border-subtle)] flex items-center justify-center">
                <Package className="w-8 h-8 text-[var(--text-secondary)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 text-[var(--text-primary)]">
                  Demander des pièces
                </h3>
                <p className="text-[var(--text-secondary)]">
                  Recherchez des pièces automobiles
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Requests */}
      {recentRequests.length > 0 && (
        <Card variant="dark">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Demandes récentes
            </h2>
            <Link href="/dashboard/requests">
              <span className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--text-secondary)] hover:underline cursor-pointer">
                Voir tout →
              </span>
            </Link>
          </div>
          <div className="space-y-6">
            {recentRequests.map((request) => {
              const unreadCount = request.vehicleMessages.length;
              return (
                <Link
                  key={request.id}
                  href={`/dashboard/requests/vehicle/${request.id}`}
                >
                  <div className="flex items-center justify-between p-4 border border-[var(--border-subtle)] rounded-xl hover:bg-[var(--hover-surface)] transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-[var(--hover-surface)] flex items-center justify-center">
                        <Car className="w-6 h-6 text-[var(--text-secondary)]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-[var(--text-primary)]">
                            {request.brand} {request.model}
                          </h3>
                          <StatusBadge status={request.status} dark />
                          {unreadCount > 0 && (
                            <span className="bg-[var(--hover-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-medium px-2 py-1 rounded-full">
                              {unreadCount} nouveau
                              {unreadCount > 1 ? "x" : ""}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Créé le {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-[var(--text-muted)]"
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
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

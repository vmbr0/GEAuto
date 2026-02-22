import { requireRole } from "@/lib/auth-helpers";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import AdminKPICard from "@/components/admin/AdminKPICard";
import AdminToolCard from "@/components/admin/AdminToolCard";
import Card from "@/components/ui/Card";

export default async function AdminPage() {
  await requireRole(UserRole.ADMIN);

  let vehicleRequests = 0;
  let partsRequests = 0;
  let pendingVehicle = 0;
  let pendingParts = 0;
  let dbError = false;

  try {
    [vehicleRequests, partsRequests, pendingVehicle, pendingParts] =
      await Promise.all([
        prisma.vehicleRequest.count(),
        prisma.partsRequest.count(),
        prisma.vehicleRequest.count({ where: { status: "PENDING" } }),
        prisma.partsRequest.count({ where: { status: "PENDING" } }),
      ]);
  } catch {
    dbError = true;
  }

  const pendingRequests = pendingVehicle + pendingParts;

  const tools = [
    {
      title: "Gestion des demandes",
      description: "Voir et gérer toutes les demandes",
      href: "/admin/requests",
      iconKey: "fileText" as const,
    },
    {
      title: "Inventaire véhicules",
      description: "Gérer l'inventaire et ajouter des véhicules",
      href: "/admin/inventory",
      iconKey: "car" as const,
    },
    {
      title: "Utilisateurs",
      description: "Liste des comptes, rendez-vous, désactivation, rôles",
      href: "/admin/users",
      iconKey: "users" as const,
    },
    {
      title: "Rendez-vous",
      description: "Calendrier et liste des rendez-vous d'essai",
      href: "/admin/appointments",
      iconKey: "calendar" as const,
    },
    {
      title: "Demandes d'info",
      description: "Demandes d'information sur les véhicules",
      href: "/admin/inquiries",
      iconKey: "messageSquare" as const,
    },
    {
      title: "Disponibilités",
      description: "Heures d'ouverture et créneaux par jour",
      href: "/admin/availability",
      iconKey: "clock" as const,
    },
    {
      title: "Jours bloqués",
      description: "Dates fermées pour les rendez-vous",
      href: "/admin/blocked-dates",
      iconKey: "calendarX" as const,
    },
    {
      title: "Recherche mobile.de",
      description: "Rechercher des véhicules sur mobile.de",
      href: "/admin/search/vehicle",
      iconKey: "search" as const,
    },
    {
      title: "Recherche Allegro.pl",
      description: "Rechercher des pièces sur Allegro.pl",
      href: "/admin/search/parts",
      iconKey: "package" as const,
    },
    {
      title: "Résultats de scraping",
      description: "Consulter tous les résultats de scraping",
      href: "/admin/scrape-results",
      iconKey: "list" as const,
    },
    {
      title: "Paramètres",
      description: "Coûts d'importation et prix COC par marque",
      href: "/admin/settings",
      iconKey: "settings" as const,
    },
  ];

  return (
    <div>
      <header className="mb-10">
        <p className="text-sm text-[#6B7280] mb-1">Admin</p>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-2">
          Panel Administrateur
        </h1>
        <p className="text-[#9AA4B2]">
          Gestion des demandes et outils de recherche
        </p>
      </header>

      {dbError && (
        <Card variant="dark" className="mb-8 border-amber-500/50 bg-amber-500/10">
          <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">
            Base de données indisponible
          </p>
          <p className="text-sm text-[#9AA4B2] mb-2">
            À la racine du projet :{" "}
            <code className="bg-[var(--hover-surface)] px-2 py-0.5 rounded text-xs">
              .\scripts\start-db.ps1
            </code>
            {" "}ou{" "}
            <code className="bg-[var(--hover-surface)] px-2 py-0.5 rounded text-xs">
              docker-compose up -d postgres redis
            </code>
          </p>
          <p className="text-xs text-[#6B7280]">
            Voir <strong>DOCKER.md</strong> (Dépannage) si Docker ne répond pas ou pour PostgreSQL en local.
          </p>
        </Card>
      )}

      {/* KPI */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <AdminKPICard
          value={vehicleRequests}
          label="Demandes véhicules"
          iconKey="car"
          index={0}
        />
        <AdminKPICard
          value={partsRequests}
          label="Demandes pièces"
          iconKey="package"
          index={1}
        />
        <AdminKPICard
          value={pendingRequests}
          label="En attente"
          iconKey="fileText"
          index={2}
        />
      </section>

      {/* Action modules */}
      <section>
        <h2 className="text-lg font-semibold text-[#F5F5F5] mb-4">
          Outils
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => (
            <AdminToolCard key={tool.href} tool={tool} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

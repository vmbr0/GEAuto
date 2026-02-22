import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { User, Mail, Shield } from "lucide-react";

export default async function DashboardSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-2">
          Paramètres
        </h1>
        <p className="text-[#B8B8B8]">
          Gérez les informations de votre compte
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card variant="dark" className="p-8">
          <h2 className="text-xl font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-[#B8B8B8]" />
            Profil
          </h2>
          <dl className="space-y-5">
            <div>
              <dt className="text-sm font-medium text-[#8A8F98]">Nom</dt>
              <dd className="mt-1 text-[#F5F5F5]">{user.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-[#8A8F98]">Email</dt>
              <dd className="mt-1 flex items-center gap-2 text-[#F5F5F5]">
                <Mail className="w-4 h-4 text-[#8A8F98]" />
                {user.email}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-[#8A8F98]">Compte</dt>
              <dd className="mt-1 flex items-center gap-2 text-[#F5F5F5]">
                <Shield className="w-4 h-4 text-[#8A8F98]" />
                {user.role === "ADMIN" ? "Administrateur" : "Utilisateur"}
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-sm text-[#B8B8B8]">
            Pour modifier votre mot de passe ou votre email, contactez
            l&apos;équipe.
          </p>
        </Card>

        <Card variant="dark" className="p-8">
          <h2 className="text-xl font-bold text-[#F5F5F5] mb-2">
            Demandes et suivi
          </h2>
          <p className="text-[#B8B8B8] mb-4">
            Consultez vos demandes de véhicules et de pièces, et suivez leur
            avancement.
          </p>
          <Link
            href="/dashboard/requests"
            className="text-sm font-medium text-[#F5F5F5] hover:text-[#B8B8B8] transition-colors"
          >
            Voir mes demandes →
          </Link>
        </Card>
      </div>
    </div>
  );
}

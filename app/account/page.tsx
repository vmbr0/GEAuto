"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Mail, Phone, Lock, Calendar, MessageCircle, Car } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

type Profile = {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: string;
  lastActivityAt: string | null;
  appointments: Array<{
    id: string;
    preferredDate: string;
    startTime: string | null;
    endTime: string | null;
    status: string;
    createdAt: string;
    vehicle: { id: string; title: string; slug: string };
  }>;
  inquiries: Array<{
    id: string;
    message: string;
    status: string;
    createdAt: string;
    vehicle: { id: string; title: string; slug: string };
  }>;
};

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
  NEW: "Nouvelle",
  CONTACTED: "Contacté",
  CLOSED: "Clôturée",
};

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [edit, setEdit] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetch("/api/account")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProfile(data);
        setEdit({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
        });
      })
      .catch(() => setMessage({ type: "error", text: "Erreur lors du chargement" }))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setProfile((p) => (p ? { ...p, ...data } : null));
      setMessage({ type: "success", text: "Profil mis à jour" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setMessage({ type: "success", text: "Mot de passe mis à jour" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setShowPasswordForm(false);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)]">
        Impossible de charger le profil.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl bg-[var(--hover-surface)] border border-[var(--border-subtle)] flex items-center justify-center">
          <User className="w-6 h-6 text-[var(--text-muted)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Mon compte</h1>
          <p className="text-sm text-[var(--text-muted)]">Gérez votre profil et consultez vos demandes</p>
        </div>
      </motion.div>

      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-red-500/20 text-red-300 border border-red-500/30"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card variant="dark">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5" /> Profil
        </h2>
        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Prénom</label>
              <input
                type="text"
                value={edit.firstName}
                onChange={(e) => setEdit((x) => ({ ...x, firstName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white"
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Nom</label>
              <input
                type="text"
                value={edit.lastName}
                onChange={(e) => setEdit((x) => ({ ...x, lastName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white"
                maxLength={50}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
            </label>
            <input
              type="email"
              value={edit.email}
              onChange={(e) => setEdit((x) => ({ ...x, email: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Téléphone
            </label>
            <input
              type="tel"
              value={edit.phone}
              onChange={(e) => setEdit((x) => ({ ...x, phone: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white"
              maxLength={30}
            />
          </div>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer le profil"}
          </Button>
        </form>
      </Card>

      <Card variant="dark">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" /> Mot de passe
        </h2>
        {!showPasswordForm ? (
          <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
            Changer le mot de passe
          </Button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Mot de passe actuel</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((x) => ({ ...x, currentPassword: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((x) => ({ ...x, newPassword: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={(e) => setPasswordForm((x) => ({ ...x, confirmNewPassword: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Enregistrement..." : "Mettre à jour le mot de passe"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowPasswordForm(false)}>
                Annuler
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card variant="dark">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" /> Mes rendez-vous
        </h2>
        {profile.appointments.length === 0 ? (
          <p className="text-white/60">Aucun rendez-vous.</p>
        ) : (
          <div className="space-y-2">
            {profile.appointments.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <div>
                  <Link
                    href={`/inventory/${a.vehicle.slug}`}
                    className="font-medium text-white hover:underline flex items-center gap-1"
                  >
                    <Car className="w-4 h-4" /> {a.vehicle.title}
                  </Link>
                  <p className="text-sm text-white/60 mt-0.5">
                    {format(new Date(a.preferredDate), "EEEE d MMM yyyy", { locale: fr })}
                    {a.startTime && a.endTime && ` · ${a.startTime} – ${a.endTime}`}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-lg ${
                    a.status === "CONFIRMED"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : a.status === "CANCELLED"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-white/10 text-white/70"
                  }`}
                >
                  {statusLabels[a.status] ?? a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card variant="dark">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" /> Mes demandes d&apos;information
        </h2>
        {profile.inquiries.length === 0 ? (
          <p className="text-white/60">Aucune demande.</p>
        ) : (
          <div className="space-y-2">
            {profile.inquiries.map((i) => (
              <div
                key={i.id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <div>
                  <Link
                    href={`/inventory/${i.vehicle.slug}`}
                    className="font-medium text-white hover:underline flex items-center gap-1"
                  >
                    <Car className="w-4 h-4" /> {i.vehicle.title}
                  </Link>
                  <p className="text-sm text-white/60 mt-0.5">
                    {format(new Date(i.createdAt), "d MMM yyyy", { locale: fr })}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-lg bg-white/10 text-white/70">
                  {statusLabels[i.status] ?? i.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

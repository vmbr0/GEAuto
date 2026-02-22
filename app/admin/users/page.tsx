"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Search,
  User,
  Car,
  MessageCircle,
  Calendar,
  X,
  Shield,
  UserX,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  disabled: boolean;
  createdAt: string;
  lastActivityAt: string | null;
  _count: { vehicleAppointments: number; vehicleInquiries: number };
};

type UserDetail = UserRow & {
  vehicleAppointments: Array<{
    id: string;
    preferredDate: string;
    startTime: string | null;
    endTime: string | null;
    status: string;
    vehicle: { id: string; title: string; slug: string };
  }>;
  vehicleInquiries: Array<{
    id: string;
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

export default function AdminUsersPage() {
  const [data, setData] = useState<{ items: UserRow[]; total: number; page: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editRole, setEditRole] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.append("search", search.trim());
    params.append("page", String(page));
    params.append("pageSize", "20");
    fetch(`/api/admin/users?${params}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(() => setData({ items: [], total: 0, page: 1, totalPages: 0 }))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    if (!detail) return;
    setEditRole(detail.role);
  }, [detail?.id, detail?.role]);

  const openDetail = (id: string) => {
    setDetail(null);
    setDetailLoading(true);
    fetch(`/api/admin/users/${id}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setDetail(d);
        setEditRole(d.role);
      })
      .catch(() => setMessage({ type: "error", text: "Erreur chargement" }))
      .finally(() => setDetailLoading(false));
  };

  const handleUpdate = async () => {
    if (!detail) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${detail.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole, disabled: detail.disabled }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Erreur");
      setDetail((prev) => (prev ? { ...prev, ...d } : null));
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((u) => (u.id === detail.id ? { ...u, ...d } : u)),
            }
          : null
      );
      setMessage({ type: "success", text: "Utilisateur mis à jour" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDisabled = async () => {
    if (!detail) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${detail.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: !detail.disabled }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Erreur");
      setDetail((prev) => (prev ? { ...prev, disabled: d.disabled } : null));
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((u) => (u.id === detail.id ? { ...u, disabled: d.disabled } : u)),
            }
          : null
      );
      setMessage({ type: "success", text: d.disabled ? "Utilisateur désactivé" : "Utilisateur réactivé" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!detail || !confirm("Désactiver cet utilisateur ?")) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${detail.id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Erreur");
      setDetail(null);
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((u) => (u.id === detail.id ? { ...u, disabled: true } : u)),
            }
          : null
      );
      setMessage({ type: "success", text: "Utilisateur désactivé" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <Users className="w-7 h-7 text-[#B8B8B8]" />
        Utilisateurs
      </h1>
      <p className="text-white/80 text-sm mb-6">
        Liste des comptes, rendez-vous et demandes. Recherche, détail, rôle et désactivation.
      </p>

      {message && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-red-500/20 text-red-300 border border-red-500/30"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card variant="dark" className="mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setLoading(true);
            const params = new URLSearchParams();
            if (search.trim()) params.append("search", search.trim());
            params.append("page", "1");
            fetch(`/api/admin/users?${params}`)
              .then((res) => res.json())
              .then((d) => {
                setData(d);
                setPage(1);
              })
              .finally(() => setLoading(false));
          }}
          className="flex flex-wrap items-center gap-4"
        >
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-5 h-5 text-white/60" />
            <Input
              dark
              placeholder="Rechercher (email, nom...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button type="submit" variant="primary">
            Rechercher
          </Button>
        </form>
      </Card>

      <Card variant="dark">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : !data?.items.length ? (
          <p className="text-white/70 py-8 text-center">Aucun utilisateur.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Utilisateur</th>
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">RDV</th>
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Demandes</th>
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Dernière activité</th>
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Rôle</th>
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                    onClick={() => openDetail(u.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">
                        {u.firstName || u.lastName
                          ? [u.firstName, u.lastName].filter(Boolean).join(" ")
                          : u.name || u.email}
                      </div>
                      <div className="text-sm text-white/60">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 text-white/80">{u._count.vehicleAppointments}</td>
                    <td className="py-3 px-4 text-white/80">{u._count.vehicleInquiries}</td>
                    <td className="py-3 px-4 text-white/60 text-sm">
                      {u.lastActivityAt
                        ? format(new Date(u.lastActivityAt), "d MMM yyyy HH:mm", { locale: fr })
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          u.role === "ADMIN" ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-white/70"
                        }`}
                      >
                        {u.role === "ADMIN" ? "Admin" : "Utilisateur"}
                      </span>
                      {u.disabled && (
                        <span className="ml-1 text-xs px-2 py-1 rounded bg-red-500/20 text-red-300">
                          Désactivé
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(u.id); }}>
                        Détail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
            <p className="text-white/60 text-sm">
              {data.total} utilisateur(s) · page {data.page}/{data.totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>

      {detailLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {detail && !detailLoading && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setDetail(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-white/10 bg-[#111318] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Utilisateur</h3>
              <button type="button" onClick={() => setDetail(null)} className="p-1 rounded hover:bg-white/10">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <div className="space-y-3 text-sm mb-6">
              <p className="text-white/90">
                <User className="w-4 h-4 inline mr-2" />
                {detail.firstName || detail.lastName
                  ? [detail.firstName, detail.lastName].filter(Boolean).join(" ")
                  : detail.name || "—"}
              </p>
              <p className="text-white/70">{detail.email}</p>
              <p className="text-white/70">{detail.phone || "—"}</p>
              <p className="text-white/60 text-xs">
                Inscrit le {format(new Date(detail.createdAt), "d MMMM yyyy", { locale: fr })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="bg-[#151922] border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
              >
                <option value="USER">Utilisateur</option>
                <option value="ADMIN">Admin</option>
              </select>
              <Button variant="primary" size="sm" disabled={saving} onClick={handleUpdate}>
                {saving ? "..." : "Enregistrer"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={handleToggleDisabled}
                title={detail.disabled ? "Réactiver" : "Désactiver"}
              >
                {detail.disabled ? (
                  <>Réactiver</>
                ) : (
                  <>
                    <UserX className="w-4 h-4 mr-1" /> Désactiver
                  </>
                )}
              </Button>
              {!detail.disabled && (
                <Button variant="ghost" size="sm" disabled={saving} onClick={handleSoftDelete}>
                  Désactiver (soft)
                </Button>
              )}
            </div>
            <h4 className="text-white font-medium mb-2 flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Rendez-vous ({detail.vehicleAppointments?.length ?? 0})
            </h4>
            <div className="space-y-1 mb-4 max-h-40 overflow-y-auto">
              {(detail.vehicleAppointments ?? []).map((a) => (
                <div key={a.id} className="text-sm p-2 rounded bg-white/5 flex justify-between items-center">
                  <Link href={`/inventory/${a.vehicle.slug}`} className="text-white hover:underline truncate">
                    {a.vehicle.title}
                  </Link>
                  <span className="text-xs text-white/60 shrink-0 ml-2">
                    {format(new Date(a.preferredDate), "d MMM yyyy", { locale: fr })}
                    {a.startTime && ` · ${a.startTime}`}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/10">{statusLabels[a.status] ?? a.status}</span>
                </div>
              ))}
              {(!detail.vehicleAppointments || detail.vehicleAppointments.length === 0) && (
                <p className="text-white/50 text-sm">Aucun</p>
              )}
            </div>
            <h4 className="text-white font-medium mb-2 flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> Demandes d&apos;info ({detail.vehicleInquiries?.length ?? 0})
            </h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {(detail.vehicleInquiries ?? []).map((i) => (
                <div key={i.id} className="text-sm p-2 rounded bg-white/5 flex justify-between items-center">
                  <Link href={`/inventory/${i.vehicle.slug}`} className="text-white hover:underline truncate">
                    {i.vehicle.title}
                  </Link>
                  <span className="text-xs text-white/60">
                    {format(new Date(i.createdAt), "d MMM yyyy", { locale: fr })}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/10">{statusLabels[i.status] ?? i.status}</span>
                </div>
              ))}
              {(!detail.vehicleInquiries || detail.vehicleInquiries.length === 0) && (
                <p className="text-white/50 text-sm">Aucune</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

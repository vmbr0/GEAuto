"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Filter, Search, Car, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

const STATUS_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "NEW", label: "Nouveau" },
  { value: "CONTACTED", label: "Contacté" },
  { value: "CLOSED", label: "Clos" },
];

type Inquiry = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  adminResponse: string | null;
  createdAt: string;
  vehicle: { id: string; title: string; slug: string };
};

export default function AdminInquiriesPage() {
  const [data, setData] = useState<{
    items: Inquiry[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Inquiry | null>(null);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, [status, page]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      params.append("page", page.toString());
      params.append("pageSize", "20");
      if (search.trim()) params.append("search", search.trim());
      const res = await fetch(`/api/admin/inquiries?${params}`);
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInquiries();
  };

  const handleUpdateInquiry = async (id: string, updates: { status?: string; adminResponse?: string }) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setDetail(null);
        setReply("");
        fetchInquiries();
      } else {
        const j = await res.json();
        alert(j.error || "Erreur");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <MessageSquare className="w-7 h-7 text-[#B8B8B8]" />
        Demandes d&apos;information
      </h1>
      <p className="text-white/80 text-sm mb-6">
        Gérer les demandes d&apos;info sur les véhicules. Répondre et changer le statut.
      </p>

      <Card variant="dark" className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
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
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-[#151922] border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="primary">
            Appliquer
          </Button>
        </form>
      </Card>

      <Card variant="dark">
        {loading ? (
          <p className="text-white/70 py-8 text-center">Chargement...</p>
        ) : !data?.items.length ? (
          <p className="text-white/70 py-8 text-center">Aucune demande.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Véhicule</th>
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Contact</th>
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Statut</th>
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((i) => (
                  <tr key={i.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white/90 text-sm">
                      {format(new Date(i.createdAt), "dd MMM yyyy HH:mm", { locale: fr })}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/inventory/${i.vehicle.id}/edit`}
                        className="text-white hover:underline flex items-center gap-1"
                      >
                        <Car className="w-4 h-4" />
                        {i.vehicle.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-white/90 text-sm">
                      {i.firstName} {i.lastName}
                      <br />
                      <span className="text-white/60">{i.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          i.status === "NEW"
                            ? "bg-amber-500/20 text-amber-300 px-2 py-1 rounded text-xs"
                            : i.status === "CLOSED"
                              ? "bg-white/10 text-white/70 px-2 py-1 rounded text-xs"
                              : "bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded text-xs"
                        }
                      >
                        {i.status === "NEW" ? "Nouveau" : i.status === "CONTACTED" ? "Contacté" : "Clos"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDetail(i);
                          setReply(i.adminResponse ?? "");
                        }}
                      >
                        Voir / Répondre
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <p className="text-white/60 text-sm">
              {data.total} demande(s) · page {data.page}/{data.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
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

      {detail && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setDetail(null)}
        >
          <Card
            variant="dark"
            className="max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              Demande · {detail.vehicle.title}
            </h3>
            <p className="text-white/80 text-sm mb-4">
              {detail.firstName} {detail.lastName} · {detail.email} · {detail.phone}
            </p>
            <div className="bg-white/5 rounded-lg p-3 mb-4">
              <p className="text-white/90 text-sm whitespace-pre-wrap">{detail.message}</p>
            </div>
            <label className="block text-white/80 text-sm font-medium mb-2">Réponse admin</label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              className="w-full bg-[#151922] border border-white/10 text-white rounded-lg p-3 text-sm mb-4"
              placeholder="Votre réponse..."
            />
            <div className="flex flex-wrap gap-2">
              <select
                id="detail-status"
                defaultValue={detail.status}
                className="bg-[#151922] border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Button
                variant="primary"
                disabled={saving}
                onClick={() => {
                  const statusEl = document.getElementById("detail-status") as HTMLSelectElement;
                  handleUpdateInquiry(detail.id, {
                    status: statusEl?.value || undefined,
                    adminResponse: reply || undefined,
                  });
                }}
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <Button variant="ghost" onClick={() => setDetail(null)}>
                Fermer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { CalendarX, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

type BlockedDateItem = {
  id: string;
  date: string;
  reason: string | null;
};

export default function AdminBlockedDatesPage() {
  const [list, setList] = useState<BlockedDateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [addDate, setAddDate] = useState("");
  const [addReason, setAddReason] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchList = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateFrom) params.append("from", dateFrom);
    if (dateTo) params.append("to", dateTo);
    fetch(`/api/admin/blocked-dates?${params}`)
      .then((res) => res.json())
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [dateFrom, dateTo]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addDate) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/blocked-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: addDate, reason: addReason.trim() || null }),
      });
      if (res.ok) {
        setAddDate("");
        setAddReason("");
        fetchList();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/blocked-dates/${id}`, { method: "DELETE" });
      if (res.ok) fetchList();
      else alert("Erreur lors de la suppression");
    } catch (e) {
      console.error(e);
      alert("Erreur");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <CalendarX className="w-7 h-7 text-[#B8B8B8]" />
        Jours bloqués
      </h1>
      <p className="text-white/80 text-sm mb-6">
        Dates sans créneaux disponibles (congés, fermeture exceptionnelle).
      </p>

      <Card variant="dark" className="mb-6">
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">Date à bloquer</label>
            <input
              type="date"
              required
              value={addDate}
              onChange={(e) => setAddDate(e.target.value)}
              className="w-40 px-3 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-white/90 mb-1">Raison (optionnel)</label>
            <input
              type="text"
              value={addReason}
              onChange={(e) => setAddReason(e.target.value)}
              placeholder="ex. Congés"
              className="w-full px-3 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <Button type="submit" variant="primary" disabled={adding}>
            {adding ? "..." : <><Plus className="w-4 h-4 mr-2" /> Bloquer</>}
          </Button>
        </form>
      </Card>

      <Card variant="dark">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <span className="text-white/70 text-sm">Filtrer :</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#151922] border border-white/10 text-white text-sm"
          />
          <span className="text-white/50">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#151922] border border-white/10 text-white text-sm"
          />
        </div>
        {loading ? (
          <p className="text-white/70 py-8 text-center">Chargement...</p>
        ) : list.length === 0 ? (
          <p className="text-white/50 py-8 text-center">Aucune date bloquée.</p>
        ) : (
          <ul className="space-y-2">
            {list.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10"
              >
                <div>
                  <span className="text-white font-medium">
                    {format(new Date(item.date), "EEEE d MMMM yyyy", { locale: fr })}
                  </span>
                  {item.reason && (
                    <span className="text-white/60 text-sm ml-2">— {item.reason}</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deletingId === item.id}
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  {deletingId === item.id ? "..." : <Trash2 className="w-4 h-4" />}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

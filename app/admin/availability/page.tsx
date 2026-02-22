"use client";

import { useState, useEffect } from "react";
import { Clock, Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const DAY_NAMES: Record<number, string> = {
  0: "Dimanche",
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
};

type AvailabilityRow = {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
};

const defaultRow = (day: number): AvailabilityRow => ({
  dayOfWeek: day,
  startTime: "09:00",
  endTime: "18:00",
  slotDuration: 30,
  isActive: day >= 1 && day <= 5,
});

export default function AdminAvailabilityPage() {
  const [rows, setRows] = useState<AvailabilityRow[]>(() =>
    [0, 1, 2, 3, 4, 5, 6].map(defaultRow)
  );
  const [loading, setLoading] = useState(true);
  const [savingDay, setSavingDay] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/availability")
      .then((res) => res.json())
      .then((list: AvailabilityRow[]) => {
        if (Array.isArray(list) && list.length > 0) {
          const byDay: Record<number, AvailabilityRow> = {};
          list.forEach((r) => {
            byDay[r.dayOfWeek] = { ...r, startTime: r.startTime ?? "09:00", endTime: r.endTime ?? "18:00", slotDuration: r.slotDuration ?? 30, isActive: r.isActive !== false };
          });
          setRows((prev) =>
            prev.map((p) => (byDay[p.dayOfWeek] ? { ...p, ...byDay[p.dayOfWeek] } : p))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateRow = (dayOfWeek: number, updates: Partial<AvailabilityRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...updates } : r))
    );
  };

  const handleSave = async (row: AvailabilityRow) => {
    setSavingDay(row.dayOfWeek);
    try {
      const res = await fetch("/api/admin/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: Number(row.dayOfWeek),
          startTime: String(row.startTime || "09:00"),
          endTime: String(row.endTime || "18:00"),
          slotDuration: Number(row.slotDuration) || 30,
          isActive: Boolean(row.isActive),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        updateRow(row.dayOfWeek, data);
      } else {
        const msg = data.details ? `${data.error}\n${data.details}` : (data.error || "Erreur lors de la mise à jour");
        alert(msg);
      }
    } catch (e) {
      console.error(e);
      alert("Erreur de connexion. Vérifiez que le serveur tourne et que la base de données est à jour (npm run db:push ou migrations).");
    } finally {
      setSavingDay(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <Clock className="w-7 h-7 text-[#B8B8B8]" />
        Disponibilités
      </h1>
      <p className="text-white/80 text-sm mb-6">
        Heures d&apos;ouverture et créneaux par jour. Les créneaux disponibles sont générés à partir de ces réglages.
      </p>

      <Card variant="dark">
        {loading ? (
          <p className="text-white/70 py-8 text-center">Chargement...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Jour</th>
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Début</th>
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Fin</th>
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Créneau (min)</th>
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Actif</th>
                  <th className="text-left py-3 px-4 text-white/70 text-sm font-medium">Enregistrer</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.dayOfWeek} className="border-b border-white/5">
                    <td className="py-3 px-4 text-white font-medium">
                      {DAY_NAMES[row.dayOfWeek]}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="time"
                        value={row.startTime}
                        onChange={(e) => updateRow(row.dayOfWeek, { startTime: e.target.value })}
                        className="w-28 px-3 py-2 rounded-lg bg-[#151922] border border-white/10 text-white"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="time"
                        value={row.endTime}
                        onChange={(e) => updateRow(row.dayOfWeek, { endTime: e.target.value })}
                        className="w-28 px-3 py-2 rounded-lg bg-[#151922] border border-white/10 text-white"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={row.slotDuration}
                        onChange={(e) =>
                          updateRow(row.dayOfWeek, { slotDuration: Number(e.target.value) })
                        }
                        className="w-24 px-3 py-2 rounded-lg bg-[#151922] border border-white/10 text-white"
                      >
                        {[15, 30, 45, 60].map((m) => (
                          <option key={m} value={m}>
                            {m} min
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => updateRow(row.dayOfWeek, { isActive: !row.isActive })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          row.isActive ? "bg-emerald-500" : "bg-white/20"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                            row.isActive ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={savingDay === row.dayOfWeek}
                        onClick={() => handleSave(row)}
                      >
                        {savingDay === row.dayOfWeek ? (
                          "..."
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-1" />
                            Enregistrer
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

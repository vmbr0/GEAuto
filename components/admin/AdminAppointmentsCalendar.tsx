"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  LayoutGrid,
  Car,
  User,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth } from "date-fns";
import { fr } from "date-fns/locale/fr";

type AppointmentItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDate: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  adminNote: string | null;
  message: string | null;
  vehicle: { id: string; title: string; slug: string };
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  CONFIRMED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  CANCELLED: "bg-red-500/20 text-red-300 border-red-500/30",
  COMPLETED: "bg-white/10 text-white/70 border-white/20",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
};

const WEEKDAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function AdminAppointmentsCalendar() {
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [monthData, setMonthData] = useState<Record<string, AppointmentItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<{ id: string; title: string }[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [detail, setDetail] = useState<AppointmentItem | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);

  const monthKey = format(viewDate, "yyyy-MM");

  useEffect(() => {
    fetch(`/api/inventory?limit=200`)
      .then((res) => res.json())
      .then((data) => {
        if (data.vehicles) setVehicles(data.vehicles);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ month: monthKey });
    if (vehicleFilter) params.append("vehicleId", vehicleFilter);
    fetch(`/api/admin/appointments/month?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setMonthData(data.days ?? {});
      })
      .catch(() => setMonthData({}))
      .finally(() => setLoading(false));
  }, [monthKey, vehicleFilter]);

  const handleUpdateAppointment = async (
    id: string,
    updates: { status?: string; adminNote?: string }
  ) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setDetail(null);
        const params = new URLSearchParams({ month: monthKey });
        if (vehicleFilter) params.append("vehicleId", vehicleFilter);
        const r = await fetch(`/api/admin/appointments/month?${params}`);
        const data = await r.json();
        if (data.days) setMonthData(data.days);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (a: AppointmentItem) => {
    setDetail(a);
    setAdminNote(a.adminNote ?? "");
  };

  if (viewMode === "week") {
    const weekStart = startOfWeek(viewDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(viewDate, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const timeSlots = Array.from({ length: 11 }, (_, i) => 8 + i); // 8h to 18h

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewDate((d) => subWeeks(d, 1))}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white font-medium min-w-[200px] text-center capitalize">
              {format(weekStart, "d MMM", { locale: fr })} – {format(weekEnd, "d MMM yyyy", { locale: fr })}
            </span>
            <button
              type="button"
              onClick={() => setViewDate((d) => addWeeks(d, 1))}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="bg-[#151922] border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Tous les véhicules</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.title}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className="p-2 rounded-xl bg-white/10 text-white"
              title="Vue mois"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111318] overflow-x-auto">
          <div className="grid grid-cols-8 gap-px bg-white/5 min-w-[600px]">
            <div className="bg-[#151922] p-2 text-xs text-white/50 font-medium" />
            {weekDays.map((d) => (
              <div key={d.toISOString()} className="bg-[#151922] p-2 text-center text-white/80 text-sm">
                {format(d, "EEE d", { locale: fr })}
              </div>
            ))}
            {timeSlots.map((hour) => (
              <div key={hour} className="contents">
                <div className="bg-[#151922] p-1 text-xs text-white/50 text-right pr-2">
                  {hour}h00
                </div>
                {weekDays.map((day) => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const dayAppointments = (monthData[dateKey] ?? []).filter((a) => {
                    if (!a.startTime) return false;
                    const startHour = parseInt(a.startTime.split(":")[0], 10);
                    return startHour === hour;
                  });
                  return (
                    <div key={`${dateKey}-${hour}`} className="min-h-[52px] bg-[#111318] p-1 space-y-1">
                      {dayAppointments.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => openDetail(a)}
                          className={`w-full text-left rounded-lg px-2 py-1.5 text-xs border truncate transition-all hover:ring-2 hover:ring-white/30 ${STATUS_COLORS[a.status] ?? "bg-white/5"}`}
                        >
                          <span className="font-medium">{a.firstName} {a.lastName}</span>
                          <span className="block text-white/60 truncate">{a.vehicle.title}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {detail && (
            <DetailModal
              detail={detail}
              adminNote={adminNote}
              setAdminNote={setAdminNote}
              onClose={() => setDetail(null)}
              onSave={(updates) => handleUpdateAppointment(detail.id, updates)}
              onCancel={() => handleUpdateAppointment(detail.id, { status: "CANCELLED" })}
              saving={saving}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Month view
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: firstDayOfWeek }, () => null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewDate((d) => subMonths(d, 1))}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-semibold text-white capitalize min-w-[180px] text-center">
            {format(viewDate, "MMMM yyyy", { locale: fr })}
          </span>
          <button
            type="button"
            onClick={() => setViewDate((d) => addMonths(d, 1))}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="bg-[#151922] border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tous les véhicules</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.title}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setViewMode("week")}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80"
            title="Vue semaine"
          >
            <Calendar className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111318] overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-white/5">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="bg-[#151922] py-2 text-center text-xs font-medium text-white/50">
              {wd}
            </div>
          ))}
          {paddingDays.map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[100px] bg-[#0B0F14]" />
          ))}
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayAppointments = monthData[dateKey] ?? [];
            return (
              <motion.div
                key={dateKey}
                className="min-h-[100px] bg-[#111318] p-1.5 flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className={`text-sm font-medium mb-1 ${isSameMonth(day, viewDate) ? "text-white" : "text-white/40"}`}>
                  {format(day, "d")}
                </span>
                <div className="flex-1 space-y-1 overflow-y-auto">
                  {loading ? (
                    <div className="w-full h-6 rounded bg-white/5 animate-pulse" />
                  ) : (
                    dayAppointments.map((a) => (
                      <motion.button
                        key={a.id}
                        type="button"
                        onClick={() => openDetail(a)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left rounded-lg px-2 py-1.5 text-xs border truncate transition-all hover:ring-2 hover:ring-white/30 ${STATUS_COLORS[a.status] ?? "bg-white/5 text-white/80"}`}
                      >
                        <span className="font-medium block truncate">{a.firstName} {a.lastName}</span>
                        <span className="block text-white/60 truncate">{a.vehicle.title}</span>
                        {a.startTime && a.endTime && (
                          <span className="block text-white/50 text-[10px]">{a.startTime} – {a.endTime}</span>
                        )}
                      </motion.button>
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {detail && (
          <DetailModal
            detail={detail}
            adminNote={adminNote}
            setAdminNote={setAdminNote}
            onClose={() => setDetail(null)}
            onSave={(updates) => handleUpdateAppointment(detail.id, updates)}
            onCancel={() => handleUpdateAppointment(detail.id, { status: "CANCELLED" })}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailModal({
  detail,
  adminNote,
  setAdminNote,
  onClose,
  onSave,
  onCancel,
  saving,
}: {
  detail: AppointmentItem;
  adminNote: string;
  setAdminNote: (v: string) => void;
  onClose: () => void;
  onSave: (u: { status?: string; adminNote?: string }) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="rounded-2xl border border-white/10 bg-[#111318] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Rendez-vous</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/70">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-white/90">
            <User className="w-4 h-4 inline mr-2 text-white/50" />
            {detail.firstName} {detail.lastName}
          </p>
          <p className="text-white/70">{detail.email} · {detail.phone}</p>
          <p className="text-white/80">
            <Car className="w-4 h-4 inline mr-2 text-white/50" />
            <Link href={`/admin/inventory/${detail.vehicle.id}/edit`} className="text-emerald-400 hover:underline">
              {detail.vehicle.title}
            </Link>
          </p>
          <p className="text-white/70">
            {format(new Date(detail.preferredDate), "EEEE d MMMM yyyy", { locale: fr })}
            {detail.startTime && detail.endTime && ` · ${detail.startTime} – ${detail.endTime}`}
          </p>
          <span className={`inline-block px-2 py-1 rounded-lg text-xs border ${STATUS_COLORS[detail.status] ?? ""}`}>
            {STATUS_LABELS[detail.status] ?? detail.status}
          </span>
          {detail.message && (
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-white/80 whitespace-pre-wrap">{detail.message}</p>
            </div>
          )}
        </div>
        <label className="block text-white/80 text-sm font-medium mt-4 mb-2">Note admin</label>
        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          rows={3}
          className="w-full bg-[#151922] border border-white/10 text-white rounded-lg p-3 text-sm mb-4"
          placeholder="Note interne..."
        />
        <div className="flex flex-wrap gap-2">
          <select
            id="modal-status"
            defaultValue={detail.status}
            className="bg-[#151922] border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <Button
            variant="primary"
            size="sm"
            disabled={saving}
            onClick={() => {
              const el = document.getElementById("modal-status") as HTMLSelectElement;
              onSave({ status: el?.value, adminNote: adminNote || undefined });
            }}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
          {detail.status !== "CANCELLED" && (
            <Button variant="outline" size="sm" disabled={saving} onClick={() => onCancel()}>
              Annuler le RDV
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

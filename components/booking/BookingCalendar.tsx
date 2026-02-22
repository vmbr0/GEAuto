"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { fr } from "date-fns/locale/fr";

type DaySummary = { totalSlots: number; availableSlots: number; isClosed: boolean };
type Slot = { startTime: string; endTime: string };

const WEEKDAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function BookingCalendar({
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
  minDate,
}: {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  selectedSlot: Slot | null;
  onSelectSlot: (slot: Slot | null) => void;
  minDate?: Date;
}) {
  const [viewDate, setViewDate] = useState(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [monthSummary, setMonthSummary] = useState<Record<string, DaySummary>>({});
  const [monthLoading, setMonthLoading] = useState(true);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const monthKey = format(viewDate, "yyyy-MM");

  useEffect(() => {
    setMonthLoading(true);
    fetch(`/api/availability/month?month=${monthKey}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.days) setMonthSummary(data.days);
      })
      .catch(() => setMonthSummary({}))
      .finally(() => setMonthLoading(false));
  }, [monthKey]);

  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      onSelectSlot(null);
      return;
    }
    setSlotsLoading(true);
    onSelectSlot(null);
    fetch(`/api/availability/${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots ?? []);
      })
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => null);

  const dayState = (dateKey: string) => {
    const s = monthSummary[dateKey];
    if (!s) return "unknown";
    if (s.isClosed) return "closed";
    if (s.totalSlots > 0 && s.availableSlots === 0) return "full";
    return "available";
  };

  const canSelectDay = (date: Date) => {
    if (minDate && date < minDate) return false;
    const key = format(date, "yyyy-MM-dd");
    const state = dayState(key);
    return state === "available" || state === "full";
  };

  return (
    <div className="space-y-6">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate((d) => subMonths(d, 1))}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-lg font-semibold text-white capitalize">
          {format(viewDate, "MMMM yyyy", { locale: fr })}
        </span>
        <button
          type="button"
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-center text-xs font-medium text-white/50 py-1"
          >
            {wd}
          </div>
        ))}
        {paddingDays.map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const state = monthLoading ? "unknown" : dayState(dateKey);
          const selected = selectedDate === dateKey;
          const disabled = !canSelectDay(day);
          const isCurrent = isToday(day);

          return (
            <motion.button
              key={dateKey}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                onSelectDate(dateKey);
              }}
              whileHover={!disabled ? { scale: 1.05 } : undefined}
              whileTap={!disabled ? { scale: 0.98 } : undefined}
              className={`
                aspect-square rounded-xl text-sm font-medium transition-all flex items-center justify-center
                ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                ${selected ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#111318] bg-emerald-500/30 text-white" : ""}
                ${!selected && state === "available" ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30" : ""}
                ${!selected && state === "full" ? "bg-red-500/20 text-red-300 hover:bg-red-500/30" : ""}
                ${!selected && state === "closed" ? "bg-white/5 text-white/40" : ""}
                ${!selected && state === "unknown" ? "bg-white/5 text-white/40" : ""}
                ${isCurrent && !selected ? "border border-white/20" : ""}
              `}
            >
              {format(day, "d")}
            </motion.button>
          );
        })}
      </div>

      {/* Time slots for selected day */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="pt-2 border-t border-white/10"
          >
            <p className="text-sm font-medium text-white/80 mb-3">
              Créneaux pour le {format(new Date(selectedDate), "EEEE d MMMM", { locale: fr })}
            </p>
            {slotsLoading ? (
              <div className="flex items-center justify-center py-8 text-white/60">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full mr-2"
                />
                <span>Chargement des créneaux...</span>
              </div>
            ) : slots.length === 0 ? (
              <p className="text-amber-400/90 text-sm py-4 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 text-center">
                Aucun créneau disponible pour cette date.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slots.map((slot) => {
                  const isSelected =
                    selectedSlot?.startTime === slot.startTime &&
                    selectedSlot?.endTime === slot.endTime;
                  return (
                    <motion.button
                      key={`${slot.startTime}-${slot.endTime}`}
                      type="button"
                      onClick={() => onSelectSlot(isSelected ? null : slot)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${isSelected
                          ? "bg-emerald-500 text-white border-2 border-emerald-400 shadow-lg shadow-emerald-500/20"
                          : "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20"
                        }
                      `}
                    >
                      {slot.startTime} – {slot.endTime}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

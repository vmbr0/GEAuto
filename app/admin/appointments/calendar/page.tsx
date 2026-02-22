"use client";

import { Calendar } from "lucide-react";
import AdminAppointmentsCalendar from "@/components/admin/AdminAppointmentsCalendar";
import Link from "next/link";

export default function AdminAppointmentsCalendarPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <Calendar className="w-7 h-7 text-[#B8B8B8]" />
        Calendrier des rendez-vous
      </h1>
      <p className="text-white/80 text-sm mb-6">
        Vue mois et semaine. Cliquez sur un créneau pour voir le détail, modifier le statut ou annuler.
      </p>
      <div className="mb-4">
        <Link
          href="/admin/appointments"
          className="text-sm text-white/70 hover:text-white"
        >
          ← Retour à la liste des rendez-vous
        </Link>
      </div>
      <AdminAppointmentsCalendar />
    </div>
  );
}

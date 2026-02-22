"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Car,
  Search,
  Package,
  List,
  Settings,
  ChevronLeft,
  ExternalLink,
  MessageSquare,
  Calendar,
  Clock,
  CalendarX,
  Users,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/requests", label: "Demandes", icon: FileText },
  { href: "/admin/inventory", label: "Inventaire", icon: Car },
  { href: "/admin/inquiries", label: "Demandes d'info", icon: MessageSquare },
  { href: "/admin/appointments", label: "Rendez-vous", icon: Calendar },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/availability", label: "Disponibilités", icon: Clock },
  { href: "/admin/blocked-dates", label: "Jours bloqués", icon: CalendarX },
  { href: "/admin/search/vehicle", label: "Recherche mobile.de", icon: Search },
  { href: "/admin/search/parts", label: "Recherche Allegro", icon: Package },
  { href: "/admin/scrape-results", label: "Résultats scraping", icon: List },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-64 shrink-0 flex flex-col border-r border-[rgba(255,255,255,0.06)]",
        "bg-[#080a0e]"
      )}
    >
      <div className="flex items-center h-14 px-4 border-b border-[rgba(255,255,255,0.06)]">
        <Link
          href="/admin"
          className="font-semibold text-[#F5F5F5] tracking-tight"
        >
          GE Auto Import · Admin
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 min-h-[40px]",
                  "transition-all duration-200",
                  "border-l-2 border-transparent",
                  isActive
                    ? "bg-[#111318] text-[#F5F5F5] border-l-white"
                    : "text-[#9AA4B2] hover:bg-[#0d0f14] hover:text-[#F5F5F5]"
                )}
              >
                <Icon className="w-5 h-5 shrink-0 opacity-90" />
                <span className="font-medium text-sm truncate">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[rgba(255,255,255,0.06)] space-y-1">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 min-h-[40px]",
            "text-[#9AA4B2] hover:bg-[#0d0f14] hover:text-[#F5F5F5]",
            "transition-all duration-200"
          )}
        >
          <ExternalLink className="w-5 h-5 shrink-0" />
          <span className="font-medium text-sm">Retour dashboard</span>
        </Link>
        <div className="px-3 py-2">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}

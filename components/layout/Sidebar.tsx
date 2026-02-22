"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Package,
  Car,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  User,
} from "lucide-react";

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/account", label: "Mon compte", icon: User },
  { href: "/dashboard/requests", label: "Mes demandes", icon: FileText },
  { href: "/inventory", label: "Véhicules", icon: Car },
  { href: "/dashboard/parts", label: "Pièces", icon: Package },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? 80 : 256,
        transition: "width 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={cn(
        "relative flex flex-col min-h-screen h-full shrink-0 overflow-hidden",
        "bg-[var(--bg-glass)] backdrop-blur-xl border-r border-[var(--border-subtle)]",
        "shadow-[0_0_60px_-12px_rgba(0,0,0,0.5)]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 min-h-[4rem] px-4 border-b border-[var(--border-subtle)] shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 overflow-hidden min-w-0"
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--hover-surface)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
            <span className="text-[var(--text-primary)] font-bold text-sm">GE</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-[var(--text-primary)] whitespace-nowrap truncate">
              GE Auto Import
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
            "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5",
            "transition-colors duration-200"
          )}
          aria-label={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 min-h-[44px]",
                  "hover:translate-x-0.5",
                  isActive
                    ? "bg-[var(--hover-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--hover-surface)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0",
                    isActive && "text-[var(--text-primary)]"
                  )}
                />
                {!collapsed && (
                  <span className="font-medium whitespace-nowrap truncate">
                    {item.label}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Retour au site vitrine */}
      <div className="p-3 border-t border-[var(--border-subtle)]">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-3 min-h-[44px]",
            "text-[var(--text-secondary)] hover:bg-[var(--hover-surface)] hover:text-[var(--text-primary)]",
            "transition-all duration-200 hover:translate-x-0.5"
          )}
        >
          <ExternalLink className="w-5 h-5 shrink-0" />
          {!collapsed && (
            <span className="font-medium whitespace-nowrap truncate">
              Retour au site
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

interface DashboardTopBarProps {
  user: { name?: string | null; email?: string | null; role?: string } | null;
}

export default function DashboardTopBar({ user }: DashboardTopBarProps) {
  return (
    <header
      className={[
        "h-16 shrink-0 flex items-center px-6 lg:px-8",
        "bg-white/5 backdrop-blur-md border-b border-[var(--border-subtle)]",
      ].join(" ")}
    >
      <div className="flex-1 min-w-0" />
      <div className="flex items-center gap-4">
        <span className="text-sm text-[var(--text-secondary)] truncate max-w-[180px]">
          {user?.name || user?.email}
        </span>
        {user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Admin
          </Link>
        )}
        <div className="w-px h-6 bg-[var(--border-subtle)]" />
        <LogoutButton />
      </div>
    </header>
  );
}

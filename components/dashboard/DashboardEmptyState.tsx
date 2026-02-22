"use client";

import { motion } from "framer-motion";
import { Car, Package } from "lucide-react";

const icons = { car: Car, package: Package } as const;

export type DashboardEmptyStateIcon = keyof typeof icons;

interface DashboardEmptyStateProps {
  iconName: DashboardEmptyStateIcon;
  title: string;
  description: string;
  action: React.ReactNode;
}

export default function DashboardEmptyState({
  iconName,
  title,
  description,
  action,
}: DashboardEmptyStateProps) {
  const Icon = icons[iconName];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111318] p-10 sm:p-14 text-center shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)]"
    >
      <div className="w-16 h-16 rounded-2xl bg-[var(--hover-surface)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-6 opacity-80">
        <Icon className="w-8 h-8 text-[#B8B8B8]" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm sm:text-base max-w-sm mx-auto mb-8 leading-relaxed" style={{ color: '#ffffff' }}>
        {description}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {action}
      </div>
    </motion.div>
  );
}

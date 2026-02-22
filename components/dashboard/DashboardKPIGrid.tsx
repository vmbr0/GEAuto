"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { cn } from "@/lib/utils";
import {
  FileText,
  Car,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  LucideIcon,
} from "lucide-react";

export interface KPICardData {
  value: number;
  label: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

function TrendIcon({
  trend,
  className,
}: {
  trend: "up" | "down" | "neutral";
  className?: string;
}) {
  if (trend === "up")
    return <TrendingUp className={className} aria-hidden />;
  if (trend === "down")
    return <TrendingDown className={className} aria-hidden />;
  return <Minus className={className} aria-hidden />;
}

function KPICard({
  data,
  index,
}: {
  data: KPICardData;
  index: number;
}) {
  const Icon = data.icon;
  const trendColors = {
    up: "text-emerald-400",
    down: "text-rose-400",
    neutral: "text-[var(--text-muted)]",
  };

  return (
    <motion.div
      variants={item}
      className="group relative overflow-hidden rounded-2xl p-6 lg:p-8 min-h-[160px] flex flex-col justify-between bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-subtle)] shadow-[0_0_40px_-12px_rgba(0,0,0,0.3)] hover:bg-[var(--hover-surface)] hover:border-[var(--border-subtle)] transition-all duration-300"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, var(--hover-surface) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">
            {data.label}
          </p>
          <p className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            <AnimatedCounter
              value={data.value}
              duration={1.8}
              triggerOnView
              className="tabular-nums"
            />
          </p>
          {data.trend && (
            <div
              className={cn(
                "mt-3 flex items-center gap-1.5 text-xs font-medium",
                trendColors[data.trend]
              )}
            >
              <TrendIcon trend={data.trend} className="w-3.5 h-3.5" />
              {data.trendLabel && <span>{data.trendLabel}</span>}
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-[var(--hover-surface)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
          <Icon className="w-6 h-6 text-[var(--text-secondary)]" />
        </div>
      </div>
    </motion.div>
  );
}

interface DashboardKPIGridProps {
  totalRequests: number;
  vehicleRequests: number;
  partsRequests: number;
  recentCount?: number;
}

export default function DashboardKPIGrid({
  totalRequests,
  vehicleRequests,
  partsRequests,
  recentCount = 0,
}: DashboardKPIGridProps) {
  const kpis: KPICardData[] = [
    {
      value: totalRequests,
      label: "Total demandes",
      icon: FileText,
      trend: "up",
      trendLabel: "vs mois dernier",
    },
    {
      value: vehicleRequests,
      label: "Demandes véhicules",
      icon: Car,
      trend: "neutral",
      trendLabel: "enregistrées",
    },
    {
      value: partsRequests,
      label: "Demandes pièces",
      icon: Package,
      trend: "neutral",
      trendLabel: "enregistrées",
    },
    {
      value: recentCount,
      label: "Récentes (5 dernières)",
      icon: FileText,
      trend: "neutral",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
    >
      {kpis.map((data, index) => (
        <KPICard key={data.label} data={data} index={index} />
      ))}
    </motion.div>
  );
}

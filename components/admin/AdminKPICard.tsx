"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { Car, Package, FileText } from "lucide-react";

const kpiIcons = { car: Car, package: Package, fileText: FileText } as const;
export type AdminKPIIconKey = keyof typeof kpiIcons;

interface AdminKPICardProps {
  value: number;
  label: string;
  iconKey: AdminKPIIconKey;
  index?: number;
}

export default function AdminKPICard({
  value,
  label,
  iconKey,
  index = 0,
}: AdminKPICardProps) {
  const Icon = kpiIcons[iconKey];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111318] p-6 transition-all duration-200 hover:bg-[#151922] hover:border-[rgba(255,255,255,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#9AA4B2] mb-1">{label}</p>
          <p className="text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F5F5]">
            <AnimatedCounter value={value} duration={1.5} triggerOnView />
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-[#151922] border border-[rgba(255,255,255,0.06)] flex items-center justify-center shrink-0 group-hover:bg-[#1a1f28] transition-colors duration-200">
          <Icon className="w-5 h-5 text-[#9AA4B2]" />
        </div>
      </div>
    </motion.div>
  );
}

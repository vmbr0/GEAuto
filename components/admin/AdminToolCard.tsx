"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Car,
  Search,
  Package,
  List,
  Settings,
  Users,
  Calendar,
  MessageSquare,
  Clock,
  CalendarX,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  fileText: FileText,
  car: Car,
  search: Search,
  package: Package,
  list: List,
  settings: Settings,
  users: Users,
  calendar: Calendar,
  messageSquare: MessageSquare,
  clock: Clock,
  calendarX: CalendarX,
};

export interface AdminToolConfig {
  title: string;
  description: string;
  href: string;
  iconKey: keyof typeof iconMap;
}

interface AdminToolCardProps {
  tool: AdminToolConfig;
  index?: number;
}

export default function AdminToolCard({ tool, index = 0 }: AdminToolCardProps) {
  const Icon = iconMap[tool.iconKey] ?? FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.1 + index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link href={tool.href}>
        <span
          className={[
            "block rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111318] p-6 h-full",
            "transition-all duration-200 hover:bg-[#151922] hover:border-[rgba(255,255,255,0.08)]",
            "hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.4)] hover:-translate-y-0.5",
          ].join(" ")}
        >
          <div className="w-12 h-12 rounded-lg bg-[#151922] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-[#9AA4B2]" />
          </div>
          <h3 className="text-lg font-bold text-[#F5F5F5] mb-2">
            {tool.title}
          </h3>
          <p className="text-sm text-[#9AA4B2] leading-relaxed">
            {tool.description}
          </p>
        </span>
      </Link>
    </motion.div>
  );
}

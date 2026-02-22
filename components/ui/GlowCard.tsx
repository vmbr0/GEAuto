"use client";

import { HTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Glassmorphism style */
  glass?: boolean;
  /** Accent glow on hover */
  glow?: boolean;
  /** Padding size */
  padding?: "none" | "sm" | "md" | "lg";
}

export default function GlowCard({
  children,
  glass = true,
  glow = true,
  padding = "md",
  className,
}: GlowCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6 md:p-8",
    lg: "p-8 md:p-10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={
        glow
          ? {
              scale: 1.02,
              transition: { duration: 0.3 },
              boxShadow: "0 0 0 1px rgba(201, 162, 39, 0.3), 0 0 40px rgba(201, 162, 39, 0.12)",
            }
          : { scale: 1.01 }
      }
      className={cn(
        "rounded-2xl border transition-all duration-300",
        glass
          ? "glass border-white/[0.06]"
          : "bg-base-card border-white/[0.06]",
        paddingClasses[padding],
        "cursor-default",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

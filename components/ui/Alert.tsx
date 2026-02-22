"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AlertProps {
  children: ReactNode;
  variant?: "error" | "success" | "info";
  className?: string;
}

export default function Alert({ children, variant = "info", className }: AlertProps) {
  const variants = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "p-4 rounded-lg border",
        variants[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

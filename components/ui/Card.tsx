"use client";

import { HTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "elevated" | "outlined" | "dark";
  hover?: boolean;
}

export default function Card({
  children,
  variant = "default",
  hover = false,
  className,
  ...props
}: CardProps) {
  const variants = {
    default: "bg-white border border-gray-200",
    elevated: "bg-white shadow-lg",
    outlined: "bg-white border-2 border-black",
    dark:
      "bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-subtle)] text-[var(--text-primary)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
    >
      <div
        className={cn(
          "rounded-xl p-6 transition-all duration-200",
          variants[variant],
          hover && "cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </motion.div>
  );
}

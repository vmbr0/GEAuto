"use client";

import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  dark?: boolean;
}

export default function Badge({
  children,
  variant = "default",
  size = "md",
  dark = false,
  className,
  ...props
}: BadgeProps) {
  const variants = dark
    ? {
        default: "bg-white/10 text-[#B8B8B8] border border-[rgba(255,255,255,0.06)]",
        success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
        warning: "bg-amber-500/15 text-amber-200 border border-amber-500/20",
        error: "bg-red-500/15 text-red-300 border border-red-500/20",
        info: "bg-sky-500/15 text-sky-200 border border-sky-500/20",
      }
    : {
        default: "bg-gray-100 text-gray-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
      };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

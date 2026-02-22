"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "border border-[var(--border-subtle)] bg-transparent text-white hover:bg-[var(--hover-surface)] active:scale-[0.98] focus:ring-[var(--text-primary)]/20 focus:ring-offset-[var(--bg-base)]",
    secondary: "bg-[var(--hover-surface)] text-[#F5F5F5] border border-[var(--border-subtle)] hover:bg-[var(--hover-surface)] active:scale-[0.98] focus:ring-[var(--text-primary)]/20 focus:ring-offset-[var(--bg-base)]",
    ghost: "text-white hover:bg-[var(--hover-surface)] hover:text-white active:scale-[0.98] focus:ring-[var(--text-primary)]/20 focus:ring-offset-[var(--bg-base)]",
    danger: "bg-red-600 text-white hover:bg-red-500 active:scale-[0.98] focus:ring-red-500 focus:ring-offset-[var(--bg-base)]",
    outline: "border border-white/20 text-[#F5F5F5] hover:bg-white/5 active:scale-[0.98] focus:ring-[var(--text-primary)]/20 focus:ring-offset-[var(--bg-base)]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.div
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={fullWidth ? "w-full" : "inline-block"}
    >
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Chargement...
        </span>
      ) : (
        children
      )}
      </button>
    </motion.div>
  );
}

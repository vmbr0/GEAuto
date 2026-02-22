"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const inputDarkClass =
  "w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-zinc-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 focus:bg-white/[0.07] hover:border-white/20";

const selectDarkClass =
  "w-full pl-12 pr-10 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 hover:border-white/20 appearance-none cursor-pointer [&>option]:bg-base-elevated";

const labelDarkClass = "block text-sm font-medium text-zinc-300 mb-2";

interface FormFieldWithIconProps {
  icon: ReactNode;
  label: string;
  error?: string;
  children: ReactNode;
  staggerIndex?: number;
}

export function FormFieldWithIcon({
  icon,
  label,
  error,
  children,
  staggerIndex = 0,
}: FormFieldWithIconProps) {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: staggerIndex * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <label className={labelDarkClass}>{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none w-5 h-5 flex items-center justify-center">
          {icon}
        </div>
        {children}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </motion.div>
  );
}

/** For textarea the icon is top-aligned */
export function FormFieldWithIconTextarea({
  icon,
  label,
  error,
  children,
  staggerIndex = 0,
}: FormFieldWithIconProps) {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: staggerIndex * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <label className={labelDarkClass}>{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-4 text-zinc-400 pointer-events-none w-5 h-5 flex items-center justify-center">
          {icon}
        </div>
        {children}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </motion.div>
  );
}

export function PremiumInput({
  icon,
  label,
  error,
  staggerIndex,
  className,
  ...props
}: {
  icon: ReactNode;
  label: string;
  error?: string;
  staggerIndex?: number;
} & React.ComponentPropsWithoutRef<"input">) {
  return (
    <FormFieldWithIcon
      icon={icon}
      label={label}
      error={error}
      staggerIndex={staggerIndex}
    >
      <input
        className={cn(inputDarkClass, className)}
        {...props}
      />
    </FormFieldWithIcon>
  );
}

export function PremiumSelect({
  icon,
  label,
  error,
  options,
  staggerIndex,
  className,
  ...props
}: {
  icon: ReactNode;
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  staggerIndex?: number;
} & React.ComponentPropsWithoutRef<"select">) {
  return (
    <FormFieldWithIcon
      icon={icon}
      label={label}
      error={error}
      staggerIndex={staggerIndex}
    >
      <select className={cn(selectDarkClass, className)} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormFieldWithIcon>
  );
}

export function PremiumTextarea({
  icon,
  label,
  error,
  staggerIndex,
  className,
  ...props
}: {
  icon: ReactNode;
  label: string;
  error?: string;
  staggerIndex?: number;
} & React.ComponentPropsWithoutRef<"textarea">) {
  return (
    <FormFieldWithIconTextarea
      icon={icon}
      label={label}
      error={error}
      staggerIndex={staggerIndex}
    >
      <textarea
        className={cn(
          inputDarkClass,
          "min-h-[120px] pt-3.5 resize-none",
          className
        )}
        {...props}
      />
    </FormFieldWithIconTextarea>
  );
}

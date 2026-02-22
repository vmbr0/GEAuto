"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  dark?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, dark = false, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            className={cn(
              "block text-sm font-medium mb-2",
              dark ? "text-[#9AA4B2]" : "text-gray-700"
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-lg border transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            dark
              ? "bg-[#151922] border-[rgba(255,255,255,0.06)] text-[#F5F5F5] placeholder:text-[#6B7280] focus:ring-[#F5F5F5]/20 focus:ring-offset-[#111318]"
              : "placeholder:text-gray-400 border-gray-300 focus:ring-black focus:border-black",
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p
            className={cn(
              "mt-1 text-sm",
              dark ? "text-[#9AA4B2]" : "text-gray-500"
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

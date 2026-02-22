"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              "w-5 h-5 rounded border-2 border-gray-300",
              "focus:ring-2 focus:ring-black focus:ring-offset-2",
              "transition-all duration-200 cursor-pointer",
              "checked:bg-black checked:border-black",
              "group-hover:border-gray-400",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
          {label && (
            <span className={cn(
              "text-sm font-medium",
              error ? "text-red-500" : "text-gray-700"
            )}>
              {label}
            </span>
          )}
        </label>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;

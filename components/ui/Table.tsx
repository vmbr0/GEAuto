"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full", className)}>{children}</table>
    </div>
  );
}

export function TableHead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <thead className={cn("bg-gray-50 border-b border-gray-200", className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: { children: ReactNode; className?: string }) {
  return <tbody className={cn("divide-y divide-gray-200", className)}>{children}</tbody>;
}

export function TableRow({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      className={cn(
        "transition-colors",
        onClick && "cursor-pointer hover:bg-gray-50",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={cn("px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn("px-6 py-4 whitespace-nowrap text-sm text-gray-900", className)}>
      {children}
    </td>
  );
}

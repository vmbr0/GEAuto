"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  X,
  Filter,
  Tag,
  Box,
  Euro,
  Calendar,
  Gauge,
  Fuel,
  Cog,
  CircleDot,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    brand: string;
    model: string;
    minPrice: string;
    maxPrice: string;
    minYear: string;
    maxYear: string;
    maxMileage: string;
    fuelType: string;
    transmission: string;
    status: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
  /** Glass floating card style + dark theme + icons */
  variant?: "default" | "glass";
}

const fuelTypeOptions = [
  { value: "", label: "Tous" },
  { value: "PETROL", label: "Essence" },
  { value: "DIESEL", label: "Diesel" },
  { value: "ELECTRIC", label: "Électrique" },
  { value: "HYBRID", label: "Hybride" },
  { value: "PLUGIN_HYBRID", label: "Hybride rechargeable" },
];

const transmissionOptions = [
  { value: "", label: "Toutes" },
  { value: "MANUAL", label: "Manuelle" },
  { value: "AUTOMATIC", label: "Automatique" },
  { value: "CVT", label: "CVT" },
];

const statusOptions = [
  { value: "", label: "Tous" },
  { value: "AVAILABLE", label: "Disponible" },
  { value: "RESERVED", label: "Réservé" },
  { value: "SOLD", label: "Vendu" },
];

const filterFields: {
  key: keyof FilterSidebarProps["filters"];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type: "input" | "pricePair" | "yearPair" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
}[] = [
  { key: "brand", label: "Marque", icon: Tag, type: "input", placeholder: "Ex: BMW" },
  { key: "model", label: "Modèle", icon: Box, type: "input", placeholder: "Ex: Série 3" },
  { key: "minPrice", label: "Prix", icon: Euro, type: "pricePair" },
  { key: "minYear", label: "Année", icon: Calendar, type: "yearPair" },
  { key: "maxMileage", label: "Kilométrage max", icon: Gauge, type: "input", placeholder: "Ex: 50000" },
  { key: "fuelType", label: "Carburant", icon: Fuel, type: "select", options: fuelTypeOptions },
  { key: "transmission", label: "Boîte de vitesse", icon: Cog, type: "select", options: transmissionOptions },
  { key: "status", label: "Statut", icon: CircleDot, type: "select", options: statusOptions },
];

export default function FilterSidebar({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  variant = "default",
}: FilterSidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const isGlass = variant === "glass";

  const inputBaseClass = isGlass
    ? "bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:ring-accent/50 focus:border-accent/50"
    : "";
  const labelClass = isGlass
    ? "text-zinc-300 font-medium"
    : "text-gray-700 font-semibold";
  const labelWithIcon = (Icon: React.ComponentType<{ className?: string }>, text: string) =>
    isGlass ? (
      <span className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-accent" />
        <span className={labelClass}>{text}</span>
      </span>
    ) : (
      text
    );

  const content = (
    <div className={isGlass ? "p-6 space-y-6" : "p-8 space-y-8"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center gap-3 w-full text-left",
            isGlass && "text-white"
          )}
        >
          <Filter className={cn("w-5 h-5", isGlass ? "text-accent" : "text-gray-600")} />
          <h2
            className={cn(
              "text-xl font-bold",
              isGlass ? "text-white" : "text-gray-900"
            )}
          >
            Filtres
          </h2>
        </button>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "p-2 rounded-lg transition-colors lg:hidden",
            isGlass ? "hover:bg-white/10 text-zinc-300" : "hover:bg-gray-100 text-gray-600"
          )}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5 overflow-hidden"
          >
            {filterFields.map((field) => {
              const Icon = field.icon;
              if (field.type === "input") {
                return (
                  <div key={field.key}>
                    <label
                      className={cn(
                        "block mb-2",
                        isGlass ? "text-zinc-300 text-sm" : "text-sm text-gray-700"
                      )}
                    >
                      {labelWithIcon(Icon, field.label)}
                    </label>
                    <Input
                      value={filters[field.key]}
                      onChange={(e) => onFilterChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={inputBaseClass}
                    />
                  </div>
                );
              }
              if (field.type === "pricePair") {
                return (
                  <div key="price">
                    <label
                      className={cn(
                        "block mb-2",
                        isGlass ? "text-zinc-300 text-sm" : "text-sm text-gray-700"
                      )}
                    >
                      {labelWithIcon(Icon, field.label)}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => onFilterChange("minPrice", e.target.value)}
                        placeholder="Min"
                        className={inputBaseClass}
                      />
                      <Input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                        placeholder="Max"
                        className={inputBaseClass}
                      />
                    </div>
                  </div>
                );
              }
              if (field.type === "yearPair") {
                return (
                  <div key="year">
                    <label
                      className={cn(
                        "block mb-2",
                        isGlass ? "text-zinc-300 text-sm" : "text-sm text-gray-700"
                      )}
                    >
                      {labelWithIcon(Icon, field.label)}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        value={filters.minYear}
                        onChange={(e) => onFilterChange("minYear", e.target.value)}
                        placeholder="Min"
                        className={inputBaseClass}
                      />
                      <Input
                        type="number"
                        value={filters.maxYear}
                        onChange={(e) => onFilterChange("maxYear", e.target.value)}
                        placeholder="Max"
                        className={inputBaseClass}
                      />
                    </div>
                  </div>
                );
              }
              return (
                <div key={field.key}>
                  <label
                    className={cn(
                      "block mb-2",
                      isGlass ? "text-zinc-300 text-sm" : "text-sm text-gray-700"
                    )}
                  >
                    {labelWithIcon(Icon, field.label)}
                  </label>
                  <Select
                    options={field.options || []}
                    value={filters[field.key]}
                    onChange={(e) => onFilterChange(field.key, e.target.value)}
                    className={cn(
                      "bg-transparent",
                      isGlass &&
                        "border-white/10 text-white focus:ring-accent/50 focus:border-accent/50 [&>option]:bg-base-elevated"
                    )}
                  />
                </div>
              );
            })}

            <div className={cn("pt-4", isGlass ? "border-t border-white/10" : "border-t border-gray-200")}>
              <Button
                onClick={onReset}
                variant={isGlass ? "outline" : "secondary"}
                fullWidth
                className={isGlass ? "border-white/20 text-zinc-300 hover:bg-white/10" : ""}
              >
                Réinitialiser
              </Button>
              <Button
                onClick={onClose}
                variant="primary"
                fullWidth
                className={cn("mt-3 lg:hidden", isGlass && "bg-accent text-white")}
              >
                Appliquer les filtres
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const sidebarInner = (
    <div
      className={cn(
        "overflow-y-auto",
        isGlass
          ? "rounded-2xl glass border border-white/10"
          : "bg-white shadow-2xl lg:shadow-none"
      )}
    >
      {content}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden pointer-events-auto"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className={cn(
              "fixed left-0 top-0 h-full z-50 lg:static lg:z-auto",
              isGlass ? "w-80" : "w-80 shadow-2xl"
            )}
          >
            {sidebarInner}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

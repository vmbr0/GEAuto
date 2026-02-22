"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Filter } from "lucide-react";
import VehicleCard from "@/components/inventory/VehicleCard";
import FilterSidebar from "@/components/inventory/FilterSidebar";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import DashboardEmptyState from "@/components/dashboard/DashboardEmptyState";

interface Vehicle {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  color?: string | null;
  priceResale?: number | null;
  pricePurchase: number;
  images: string[];
  status: string;
  potentialMargin?: number | null;
}

export default function DashboardVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    brand: "",
    model: "",
    minPrice: "",
    maxPrice: "",
    minYear: "",
    maxYear: "",
    maxMileage: "",
    fuelType: "",
    transmission: "",
    status: "",
  });
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append("sortBy", sortBy);
      params.append("page", page.toString());
      params.append("limit", "12");

      const response = await fetch(`/api/inventory?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setVehicles(data.vehicles ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, page]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters({
      brand: "",
      model: "",
      minPrice: "",
      maxPrice: "",
      minYear: "",
      maxYear: "",
      maxMileage: "",
      fuelType: "",
      transmission: "",
      status: "",
    });
    setPage(1);
  };

  const sortOptions = [
    { value: "newest", label: "Plus récent" },
    { value: "priceAsc", label: "Prix croissant" },
    { value: "priceDesc", label: "Prix décroissant" },
    { value: "brandAsc", label: "Marque A → Z" },
    { value: "brandDesc", label: "Marque Z → A" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F5F5]">
            Véhicules
          </h1>
          <p className="text-[#B8B8B8] mt-2">
            Parcourir l&apos;inventaire des véhicules disponibles.
          </p>
        </div>
        <Link
          href="/inventory"
          className="text-sm font-medium text-[#F5F5F5] hover:text-[#B8B8B8] transition-colors"
        >
          Voir la page inventaire complète →
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="hidden lg:block lg:w-80 flex-shrink-0">
          <FilterSidebar
            isOpen={true}
            onClose={() => {}}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <Button
              onClick={() => setSidebarOpen(true)}
              variant="secondary"
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-sm text-[#B8B8B8]">Trier par:</span>
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-48 bg-[#111318] border-[rgba(255,255,255,0.06)] text-[#F5F5F5] focus:ring-[var(--text-primary)]/20 focus:ring-offset-[var(--bg-base)] [&>option]:bg-[#111318]"
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-[#B8B8B8]">
              {loading ? (
                "Chargement..."
              ) : (
                <>
                  <span className="font-semibold text-[#F5F5F5]">
                    {vehicles.length}
                  </span>{" "}
                  véhicule{vehicles.length !== 1 ? "s" : ""} trouvé
                  {vehicles.length !== 1 ? "s" : ""}
                </>
              )}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111318] aspect-[16/10] animate-pulse shadow-[0_4px_24px_-4px_rgba(0,0,0,0.2)]"
                />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <DashboardEmptyState
              iconName="car"
              title="Aucun véhicule trouvé"
              description="Aucun véhicule ne correspond à vos filtres. Réinitialisez les critères pour élargir la recherche."
              action={
                <Button onClick={handleReset} variant="secondary">
                  Réinitialiser les filtres
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle, index) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    index={index}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <Button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="secondary"
                  >
                    Précédent
                  </Button>
                  <span className="text-[#B8B8B8] text-sm">
                    Page {page} sur {totalPages}
                  </span>
                  <Button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    variant="secondary"
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <FilterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />
    </div>
  );
}

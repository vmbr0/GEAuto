"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import VehicleCard from "@/components/inventory/VehicleCard";
import FilterSidebar from "@/components/inventory/FilterSidebar";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

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
  coverImage?: string | null;
  images: string[];
  status: string;
  potentialMargin?: number | null;
}

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=85";

export default function InventoryPage() {
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
        setVehicles(data.vehicles);
        setTotalPages(data.pagination.totalPages);
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
    <main className="min-h-screen bg-base">
      {/* Hero – large background image, parallax, title + subheading */}
      <section className="relative min-h-[50vh] flex flex-col justify-end overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(11,15,20,0.98) 0%, rgba(11,15,20,0.5) 50%, rgba(11,15,20,0.2) 100%)",
          }}
        />
        <div className="relative z-10 w-full px-6 sm:px-10 md:px-14 lg:px-20 pb-16 md:pb-20 pt-32">
          <RevealOnScroll>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight max-w-4xl">
              Inventaire Premium
            </h1>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <p className="mt-4 text-lg md:text-xl text-zinc-300 max-w-2xl">
              Découvrez notre sélection de véhicules d&apos;exception importés
              d&apos;Allemagne. Qualité, performance et transparence.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Section divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Content – floating filter + grid */}
      <section className="section-vertical-rhythm">
        <div className="w-full px-6 sm:px-10 md:px-14 lg:px-20">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
            {/* Desktop: sticky floating glass filter panel */}
            <div className="hidden lg:block lg:w-80 flex-shrink-0">
              <div className="sticky top-28">
                <FilterSidebar
                  isOpen={true}
                  onClose={() => {}}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleReset}
                  variant="glass"
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {/* Toolbar: mobile filter button + sort */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <Button
                  onClick={() => setSidebarOpen(true)}
                  variant="outline"
                  size="sm"
                  className="lg:hidden border-white/20 text-zinc-300 hover:bg-white/10"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm text-zinc-300 shrink-0">
                    Trier par
                  </span>
                  <Select
                    options={sortOptions}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 sm:w-48 bg-white/5 border-white/10 text-white focus:ring-accent/50 focus:border-accent/50 [&>option]:bg-base-elevated"
                  />
                </div>
              </div>

              {/* Count */}
              <p className="text-zinc-300 mb-8">
                {loading ? (
                  "Chargement..."
                ) : (
                  <>
                    <span className="font-semibold text-white">
                      {vehicles.length}
                    </span>{" "}
                    véhicule{vehicles.length > 1 ? "s" : ""} trouvé
                    {vehicles.length > 1 ? "s" : ""}
                  </>
                )}
              </p>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl aspect-[4/3] bg-base-elevated animate-pulse border border-white/5"
                    />
                  ))}
                </div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-24 rounded-2xl glass border border-white/10">
                  <p className="text-xl text-zinc-300 mb-6">
                    Aucun véhicule trouvé
                  </p>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-white/20 text-zinc-300 hover:bg-white/10"
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {vehicles.map((vehicle, index) => (
                      <VehicleCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        index={index}
                      />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-16">
                      <Button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        variant="outline"
                        className="border-white/20 text-zinc-300 hover:bg-white/10 disabled:opacity-50"
                      >
                        Précédent
                      </Button>
                      <span className="text-zinc-300 text-sm">
                        Page {page} sur {totalPages}
                      </span>
                      <Button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        variant="outline"
                        className="border-white/20 text-zinc-300 hover:bg-white/10 disabled:opacity-50"
                      >
                        Suivant
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      <FilterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        variant="glass"
      />
    </main>
  );
}

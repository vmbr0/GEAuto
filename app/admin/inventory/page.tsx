"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { VehicleStatus } from "@prisma/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

const statusOptions = [
  { value: "", label: "Tous" },
  { value: "AVAILABLE", label: "Disponible" },
  { value: "RESERVED", label: "Réservé" },
  { value: "SOLD", label: "Vendu" },
];

const statusColors: Record<VehicleStatus, string> = {
  AVAILABLE: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
  RESERVED: "bg-amber-500/15 text-amber-200 border border-amber-500/20",
  SOLD: "bg-white/10 text-[#9AA4B2] border border-[rgba(255,255,255,0.06)]",
};

const statusLabels: Record<VehicleStatus, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Réservé",
  SOLD: "Vendu",
};

export default function AdminInventoryPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    brand: "",
  });
  const [sortBy, setSortBy] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    vehicle: any | null;
  }>({ open: false, vehicle: null });

  useEffect(() => {
    fetchVehicles();
  }, [filters, sortBy, page]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.brand) params.append("brand", filters.brand);
      params.append("sortBy", sortBy);
      params.append("page", page.toString());
      params.append("limit", "20");

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
  };

  const handleDelete = async () => {
    if (!deleteModal.vehicle) return;

    try {
      const response = await fetch(
        `/api/admin/inventory/${deleteModal.vehicle.id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setDeleteModal({ open: false, vehicle: null });
        fetchVehicles();
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const handleStatusToggle = async (vehicle: any, newStatus: VehicleStatus) => {
    try {
      const response = await fetch(`/api/admin/inventory/${vehicle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchVehicles();
      }
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  return (
    <div>
      <header className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-[#6B7280] mb-1">Admin</p>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-2">
              Inventaire
            </h1>
            <p className="text-[#9AA4B2]">
              Gérez votre inventaire de véhicules
            </p>
          </div>
          <Button
            onClick={() => router.push("/admin/inventory/create")}
            variant="primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un véhicule
          </Button>
        </div>
      </header>

      {/* Filters */}
      <Card variant="dark" className="mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="Rechercher par marque"
                value={filters.brand}
                onChange={(e) =>
                  setFilters({ ...filters, brand: e.target.value })
                }
                placeholder="Ex: BMW"
                className="bg-[#151922] border-[rgba(255,255,255,0.06)] text-[#F5F5F5] placeholder:text-[#6B7280]"
              />
            </div>
            <div>
              <Select
                label="Statut"
                options={statusOptions}
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="bg-[#151922] border-[rgba(255,255,255,0.06)] text-[#F5F5F5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#9AA4B2] mb-2">
                Trier par
              </label>
              <Select
                options={[
                  { value: "createdAt:desc", label: "Plus récent" },
                  { value: "createdAt:asc", label: "Plus ancien" },
                  { value: "priceResale:desc", label: "Prix décroissant" },
                  { value: "priceResale:asc", label: "Prix croissant" },
                ]}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#151922] border-[rgba(255,255,255,0.06)] text-[#F5F5F5]"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card variant="dark" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#151922] border-b border-[rgba(255,255,255,0.06)]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9AA4B2] uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9AA4B2] uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9AA4B2] uppercase tracking-wider">
                  Marque
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9AA4B2] uppercase tracking-wider">
                  Année
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9AA4B2] uppercase tracking-wider">
                  Prix achat
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9AA4B2] uppercase tracking-wider">
                  Prix revente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9AA4B2] uppercase tracking-wider">
                  Coût import
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9AA4B2] uppercase tracking-wider">
                  Marge
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9AA4B2] uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#9AA4B2] uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#9AA4B2] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-[#9AA4B2] border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-[#9AA4B2]">
                    Aucun véhicule trouvé
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <motion.tr
                    key={vehicle.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#151922]">
                        {vehicle.images?.[0] ? (
                          <Image
                            src={vehicle.images[0]}
                            alt={vehicle.title}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#6B7280]">
                            <span className="text-xs">Pas d'image</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#F5F5F5]">
                        {vehicle.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#9AA4B2]">{vehicle.brand}</td>
                    <td className="px-6 py-4 text-[#9AA4B2]">{vehicle.year}</td>
                    <td className="px-6 py-4 text-[#F5F5F5] font-semibold">
                      {vehicle.pricePurchase.toLocaleString()} €
                    </td>
                    <td className="px-6 py-4 text-[#F5F5F5] font-semibold">
                      {vehicle.priceResale
                        ? `${vehicle.priceResale.toLocaleString()} €`
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-[#9AA4B2]">
                      {vehicle.importCost
                        ? `${vehicle.importCost.toLocaleString()} €`
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {vehicle.potentialMargin ? (
                        <span
                          className={
                            vehicle.potentialMargin > 0
                              ? "text-emerald-400 font-semibold"
                              : "text-red-400 font-semibold"
                          }
                        >
                          {vehicle.potentialMargin > 0 ? "+" : ""}
                          {vehicle.potentialMargin.toLocaleString()} €
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={vehicle.status}
                        onChange={(e) =>
                          handleStatusToggle(
                            vehicle,
                            e.target.value as VehicleStatus
                          )
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold bg-transparent ${statusColors[vehicle.status as VehicleStatus]}`}
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#9AA4B2]">
                      {format(new Date(vehicle.createdAt), "dd/MM/yyyy", {
                        locale: fr,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            router.push(`/admin/inventory/${vehicle.id}/edit`)
                          }
                          className="p-2 text-[#F5F5F5] hover:bg-[rgba(255,255,255,0.06)] rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({ open: true, vehicle })
                          }
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
            <div className="text-sm text-[#9AA4B2]">
              Page {page} sur {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="secondary"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="secondary"
                size="sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, vehicle: null })}
        title="Supprimer le véhicule"
        dark
      >
        <div className="p-6">
          <p className="text-[#9AA4B2] mb-6">
            Êtes-vous sûr de vouloir supprimer le véhicule{" "}
            <strong>{deleteModal.vehicle?.title}</strong> ? Cette action est
            irréversible.
          </p>
          <div className="flex items-center justify-end gap-4">
            <Button
              onClick={() => setDeleteModal({ open: false, vehicle: null })}
              variant="secondary"
            >
              Annuler
            </Button>
            <Button onClick={handleDelete} variant="primary" className="bg-red-600 hover:bg-red-700">
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

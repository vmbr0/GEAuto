"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";

interface GlobalSettings {
  regionPricePerCV: number;
  defaultTransportCost: number;
  germanTempPlateCost: number;
}

interface CocPriceRow {
  id: string;
  brand: string;
  price: number;
}

export default function AdminSettingsPage() {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    regionPricePerCV: 46.15,
    defaultTransportCost: 800,
    germanTempPlateCost: 150,
  });
  const [cocPrices, setCocPrices] = useState<CocPriceRow[]>([]);
  const [loadingGlobal, setLoadingGlobal] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [loadingCoc, setLoadingCoc] = useState(true);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({ visible: false, message: "", type: "success" });
  const [cocModal, setCocModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    id?: string;
    brand: string;
    price: string;
  }>({ open: false, mode: "add", brand: "", price: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    brand: string;
  }>({ open: false, id: "", brand: "" });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    const fetchGlobal = async () => {
      try {
        const res = await fetch("/api/admin/settings/global");
        if (res.ok) {
          const data = await res.json();
          setGlobalSettings({
            regionPricePerCV: data.regionPricePerCV ?? 46.15,
            defaultTransportCost: data.defaultTransportCost ?? 800,
            germanTempPlateCost: data.germanTempPlateCost ?? 150,
          });
        }
      } catch (e) {
        showToast("Erreur lors du chargement des paramètres", "error");
      } finally {
        setLoadingGlobal(false);
      }
    };
    fetchGlobal();
  }, []);

  useEffect(() => {
    const fetchCoc = async () => {
      try {
        const res = await fetch("/api/admin/settings/coc");
        if (res.ok) {
          const data = await res.json();
          setCocPrices(data);
        }
      } catch (e) {
        showToast("Erreur lors du chargement des prix COC", "error");
      } finally {
        setLoadingCoc(false);
      }
    };
    fetchCoc();
  }, []);

  const handleSaveGlobal = async () => {
    setSavingGlobal(true);
    try {
      const res = await fetch("/api/admin/settings/global", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(globalSettings),
      });
      const data = await res.json();
      if (res.ok) {
        setGlobalSettings({
          regionPricePerCV: data.regionPricePerCV,
          defaultTransportCost: data.defaultTransportCost,
          germanTempPlateCost: data.germanTempPlateCost,
        });
        showToast("Paramètres enregistrés avec succès", "success");
      } else {
        showToast(data.error || "Erreur lors de l'enregistrement", "error");
      }
    } catch (e) {
      showToast("Erreur lors de l'enregistrement", "error");
    } finally {
      setSavingGlobal(false);
    }
  };

  const openAddCoc = () => {
    setCocModal({
      open: true,
      mode: "add",
      brand: "",
      price: "",
    });
  };

  const openEditCoc = (row: CocPriceRow) => {
    setCocModal({
      open: true,
      mode: "edit",
      id: row.id,
      brand: row.brand,
      price: String(row.price),
    });
  };

  const handleSaveCoc = async () => {
    const price = parseFloat(cocModal.price);
    if (isNaN(price) || price < 0) {
      showToast("Prix invalide", "error");
      return;
    }
    if (!cocModal.brand.trim()) {
      showToast("La marque est requise", "error");
      return;
    }

    try {
      const url =
        cocModal.mode === "edit"
          ? `/api/admin/settings/coc/${cocModal.id}`
          : "/api/admin/settings/coc";
      const method = cocModal.mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: cocModal.brand.trim(),
          price,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCocModal({ ...cocModal, open: false });
        const listRes = await fetch("/api/admin/settings/coc");
        if (listRes.ok) setCocPrices(await listRes.json());
        showToast(
          cocModal.mode === "edit"
            ? "Prix COC mis à jour"
            : "Marque ajoutée avec succès",
          "success"
        );
      } else {
        showToast(data.error || "Erreur", "error");
      }
    } catch (e) {
      showToast("Erreur lors de l'enregistrement", "error");
    }
  };

  const handleDeleteCoc = async () => {
    if (!deleteConfirm.id) return;
    try {
      const res = await fetch(`/api/admin/settings/coc/${deleteConfirm.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCocPrices((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
        setDeleteConfirm({ open: false, id: "", brand: "" });
        showToast("Prix COC supprimé", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Erreur lors de la suppression", "error");
      }
    } catch (e) {
      showToast("Erreur lors de la suppression", "error");
    }
  };

  return (
    <div>
      <header className="mb-10">
        <p className="text-sm text-[#6B7280] mb-1">Admin</p>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-2">
          Paramètres
        </h1>
        <p className="text-[#9AA4B2]">
          Configuration des coûts d'importation et des prix COC par marque
        </p>
      </header>

      {/* Section 1: Regional Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card variant="dark" className="mb-8">
          <div className="p-8">
            <h2 className="text-xl font-bold text-[#F5F5F5] mb-6">
              Paramètres régionaux
            </h2>
            {loadingGlobal ? (
              <div className="flex items-center gap-2 text-[#9AA4B2]">
                <Loader2 className="w-5 h-5 animate-spin" />
                Chargement...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Prix par CV (€)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={String(globalSettings.regionPricePerCV)}
                  onChange={(e) =>
                    setGlobalSettings((prev) => ({
                      ...prev,
                      regionPricePerCV: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                <Input
                  label="Coût transport par défaut (€)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={String(globalSettings.defaultTransportCost)}
                  onChange={(e) =>
                    setGlobalSettings((prev) => ({
                      ...prev,
                      defaultTransportCost: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                <Input
                  label="Plaque temporaire allemande (€)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={String(globalSettings.germanTempPlateCost)}
                  onChange={(e) =>
                    setGlobalSettings((prev) => ({
                      ...prev,
                      germanTempPlateCost: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            )}
            <div className="mt-6">
              <Button
                onClick={handleSaveGlobal}
                disabled={loadingGlobal || savingGlobal}
                variant="primary"
              >
                {savingGlobal ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer les paramètres
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Section 2: COC Prices */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card variant="dark">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#F5F5F5]">
                Prix COC par marque
              </h2>
              <Button onClick={openAddCoc} variant="primary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une marque
              </Button>
            </div>

            {loadingCoc ? (
              <div className="flex items-center gap-2 text-[#9AA4B2] py-8">
                <Loader2 className="w-5 h-5 animate-spin" />
                Chargement...
              </div>
            ) : cocPrices.length === 0 ? (
              <p className="text-[#9AA4B2] py-8">
                Aucune marque configurée. Les véhicules utiliseront le prix COC
                par défaut (200 €).
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-[rgba(255,255,255,0.06)]">
                <table className="w-full">
                  <thead className="bg-[#151922] border-b border-[rgba(255,255,255,0.06)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#9AA4B2] uppercase">
                        Marque
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#9AA4B2] uppercase">
                        Prix (€)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-[#9AA4B2] uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
                    {cocPrices.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-[#F5F5F5]">
                          {row.brand}
                        </td>
                        <td className="px-4 py-3 text-[#9AA4B2]">
                          {row.price.toLocaleString()} €
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openEditCoc(row)}
                            className="p-2 text-[#F5F5F5] hover:bg-[rgba(255,255,255,0.06)] rounded-lg mr-2 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirm({
                                open: true,
                                id: row.id,
                                brand: row.brand,
                              })
                            }
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      <Modal
        isOpen={cocModal.open}
        onClose={() => setCocModal((p) => ({ ...p, open: false }))}
        title={cocModal.mode === "add" ? "Ajouter une marque" : "Modifier le prix COC"}
        size="sm"
        dark
      >
        <div className="p-6 space-y-4">
          <Input
            label="Marque"
            value={cocModal.brand}
            onChange={(e) =>
              setCocModal((p) => ({ ...p, brand: e.target.value }))
            }
            placeholder="Ex: BMW"
            disabled={cocModal.mode === "edit"}
            dark
          />
          <Input
            label="Prix COC (€)"
            type="number"
            step="0.01"
            min="0"
            value={cocModal.price}
            onChange={(e) =>
              setCocModal((p) => ({ ...p, price: e.target.value }))
            }
            placeholder="200"
            dark
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setCocModal((p) => ({ ...p, open: false }))}
            >
              Annuler
            </Button>
            <Button variant="primary" onClick={handleSaveCoc}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: "", brand: "" })}
        title="Supprimer le prix COC"
        size="sm"
        dark
      >
        <div className="p-6">
          <p className="text-[#9AA4B2] mb-6">
            Supprimer le prix COC pour la marque{" "}
            <strong>{deleteConfirm.brand}</strong> ? Les véhicules de cette
            marque utiliseront le prix par défaut (200 €).
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                setDeleteConfirm({ open: false, id: "", brand: "" })
              }
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteCoc}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onDismiss={() => setToast((p) => ({ ...p, visible: false }))}
        dark
      />
    </div>
  );
}

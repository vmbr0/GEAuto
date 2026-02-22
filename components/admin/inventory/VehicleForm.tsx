"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Upload, X, Loader2, Calculator } from "lucide-react";
import { inventoryVehicleSchema, InventoryVehicleFormData } from "@/lib/validations/inventory";
import { FuelType, Transmission, VehicleStatus } from "@prisma/client";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Image from "next/image";

const fuelTypeOptions = [
  { value: "PETROL", label: "Essence" },
  { value: "DIESEL", label: "Diesel" },
  { value: "ELECTRIC", label: "Électrique" },
  { value: "HYBRID", label: "Hybride" },
  { value: "PLUGIN_HYBRID", label: "Hybride rechargeable" },
];

const transmissionOptions = [
  { value: "MANUAL", label: "Manuelle" },
  { value: "AUTOMATIC", label: "Automatique" },
  { value: "CVT", label: "CVT" },
];

const statusOptions = [
  { value: "AVAILABLE", label: "Disponible" },
  { value: "RESERVED", label: "Réservé" },
  { value: "SOLD", label: "Vendu" },
];

interface VehicleFormProps {
  vehicle?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VehicleForm({ vehicle, onSuccess, onCancel }: VehicleFormProps) {
  const [uploading, setUploading] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(vehicle?.coverImage ?? null);
  const [images, setImages] = useState<string[]>(vehicle?.images || []);
  const [calculations, setCalculations] = useState({
    carteGrise: 0,
    importCost: 0,
    potentialMargin: 0,
  });
  const [config, setConfig] = useState({
    regionPricePerCV: 46.15,
    defaultTransportCost: 800,
    germanPlateCost: 150,
    cocPrice: 200,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InventoryVehicleFormData>({
    resolver: zodResolver(inventoryVehicleSchema),
    defaultValues: vehicle || {
      status: "AVAILABLE",
      countryOrigin: "DE",
      coverImage: undefined,
      images: [],
    },
  });

  // Charger la configuration admin
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/admin/config");
        if (response.ok) {
          const data = await response.json();
          setConfig({
            regionPricePerCV: data.regionPricePerCV || 46.15,
            defaultTransportCost: data.defaultTransportCost || 800,
            germanPlateCost: data.germanPlateCost || 150,
            cocPrice: data.cocPrice || 200,
          });
        }
      } catch (error) {
        console.error("Error fetching config:", error);
        // Utiliser les valeurs par défaut en cas d'erreur
      }
    };
    fetchConfig();
  }, []);

  // Surveiller les changements pour recalculer
  const purchasePrice = watch("pricePurchase") || 0;
  const resalePrice = watch("priceResale") || 0;
  const cvFiscaux = watch("cvFiscaux") || 0;
  const brand = watch("brand") || "";

  // Récupérer le prix COC pour la marque
  useEffect(() => {
    const fetchCocPrice = async () => {
      if (brand) {
        try {
          const response = await fetch(`/api/admin/coc-price/${brand.toUpperCase()}`);
          if (response.ok) {
            const data = await response.json();
            setConfig((prev) => ({ ...prev, cocPrice: data.price || 200 }));
          }
        } catch (error) {
          // Utiliser le prix par défaut
        }
      }
    };
    fetchCocPrice();
  }, [brand]);

  useEffect(() => {
    if (purchasePrice > 0 && cvFiscaux > 0) {
      const carteGrise = cvFiscaux * config.regionPricePerCV;
      const importCost =
        purchasePrice +
        carteGrise +
        config.cocPrice +
        config.germanPlateCost +
        config.defaultTransportCost;
      const potentialMargin = resalePrice > 0 ? resalePrice - importCost : 0;

      setCalculations({
        carteGrise,
        importCost,
        potentialMargin,
      });
    }
  }, [purchasePrice, resalePrice, cvFiscaux, config]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/inventory/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (response.ok) {
        setCoverImage(data.path);
        setValue("coverImage", data.path);
      } else {
        alert(data.error || "Erreur lors de l'upload");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/inventory/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImages((prev) => [...prev, data.path]);
        setValue("images", [...images, data.path]);
      } else {
        alert(data.error || "Erreur lors de l'upload");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue("images", newImages);
  };

  const onSubmit = async (data: InventoryVehicleFormData) => {
    try {
      const url = vehicle
        ? `/api/admin/inventory/${vehicle.id}`
        : "/api/admin/inventory";
      const method = vehicle ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          coverImage: coverImage || null,
          images,
          importCost: calculations.importCost,
          potentialMargin: calculations.potentialMargin > 0 ? calculations.potentialMargin : null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        alert(result.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="rounded-2xl border border-white/5 bg-[#111318] backdrop-blur-sm p-8">
        <h2 className="text-2xl font-bold text-[#F5F5F5] mb-6">
          Informations générales
        </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input label="Titre *" {...register("title")} error={errors.title?.message} placeholder="Ex: BMW Série 3 320d M Sport" dark />
            </div>
            <div>
              <Input label="Marque *" {...register("brand")} error={errors.brand?.message} placeholder="Ex: BMW" dark />
            </div>
            <div>
              <Input label="Modèle *" {...register("model")} error={errors.model?.message} placeholder="Ex: Série 3" dark />
            </div>
            <div>
              <Input label="Année *" type="number" {...register("year", { valueAsNumber: true })} error={errors.year?.message} placeholder="2020" dark />
            </div>
            <div>
              <Input label="Kilométrage *" type="number" {...register("mileage", { valueAsNumber: true })} error={errors.mileage?.message} placeholder="50000" dark />
            </div>
            <div>
              <Input label="Couleur" {...register("color")} error={errors.color?.message} placeholder="Ex: Noir" dark />
            </div>
            <div>
              <Select label="Carburant *" options={fuelTypeOptions} {...register("fuelType")} error={errors.fuelType?.message} className="bg-[#151922] border-white/10 text-white [&>option]:bg-[#111318] focus:border-white/30" />
            </div>
            <div>
              <Select label="Boîte de vitesse *" options={transmissionOptions} {...register("transmission")} error={errors.transmission?.message} className="bg-[#151922] border-white/10 text-white [&>option]:bg-[#111318] focus:border-white/30" />
            </div>
            <div>
              <Input label="CV Fiscaux *" type="number" {...register("cvFiscaux", { valueAsNumber: true })} error={errors.cvFiscaux?.message} placeholder="10" dark />
            </div>
            <div>
              <Input label="Puissance (ch)" type="number" {...register("powerHp", { setValueAs: (v) => (v === "" || v === undefined ? undefined : parseInt(String(v), 10)) })} error={errors.powerHp?.message} placeholder="Ex: 150" dark />
            </div>
            <div>
              <Input label="Pays d'origine" {...register("countryOrigin")} error={errors.countryOrigin?.message} placeholder="DE" defaultValue="DE" dark />
            </div>
            <div>
              <Select label="Statut *" options={statusOptions} {...register("status")} error={errors.status?.message} className="bg-[#151922] border-white/10 text-white [&>option]:bg-[#111318] focus:border-white/30" />
            </div>
          </div>
      </section>

      <section className="rounded-2xl border border-white/5 bg-[#111318] backdrop-blur-sm p-8">
        <h2 className="text-2xl font-bold text-[#F5F5F5] mb-6">Prix</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input label="Prix d'achat (€) *" type="number" step="0.01" {...register("pricePurchase", { valueAsNumber: true })} error={errors.pricePurchase?.message} placeholder="25000" dark />
          </div>
          <div>
            <Input label="Prix de revente (€)" type="number" step="0.01" {...register("priceResale", { valueAsNumber: true })} error={errors.priceResale?.message} placeholder="32000" dark />
          </div>
        </div>

        {(purchasePrice > 0 || cvFiscaux > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 p-6 rounded-xl border border-white/10 bg-[#151922]"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-[#9AA4B2]" />
              <h3 className="font-semibold text-[#F5F5F5]">Calcul automatique</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-[#9AA4B2]">Carte grise</div>
                <div className="text-lg font-semibold text-[#F5F5F5]">{calculations.carteGrise.toLocaleString()} €</div>
                <div className="text-xs text-[#6B7280]">({cvFiscaux} CV × {config.regionPricePerCV} €)</div>
              </div>
              <div>
                <div className="text-[#9AA4B2]">Coût d'importation</div>
                <div className="text-lg font-semibold text-[#F5F5F5]">{calculations.importCost.toLocaleString()} €</div>
                <div className="text-xs text-[#6B7280]">Achat + Carte grise + COC + Plaque + Transport</div>
              </div>
              {resalePrice > 0 && (
                <div>
                  <div className="text-[#9AA4B2]">Marge potentielle</div>
                  <div className={`text-lg font-semibold ${calculations.potentialMargin > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {calculations.potentialMargin > 0 ? "+" : ""}{calculations.potentialMargin.toLocaleString()} €
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </section>

      <section className="rounded-2xl border border-white/5 bg-[#111318] backdrop-blur-sm p-8">
        <h2 className="text-2xl font-bold text-[#F5F5F5] mb-6">Images</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#9AA4B2] mb-2">Image de couverture (bannière hero + cartes liste)</label>
            <div className="flex flex-wrap items-start gap-4">
              {coverImage ? (
                <div className="relative group">
                  <div className="relative w-40 h-28 rounded-xl overflow-hidden bg-[#151922] border border-white/10">
                    <Image src={coverImage} alt="Couverture" fill className="object-cover" unoptimized />
                  </div>
                  <button type="button" onClick={() => { setCoverImage(null); setValue("coverImage", undefined); }} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : null}
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border border-white/10 bg-[#151922] text-[#F5F5F5] hover:border-white/20 transition-colors h-fit">
                <Upload className="w-5 h-5" />
                {uploading ? "Upload…" : coverImage ? "Remplacer" : "Choisir une image"}
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploading} />
              </label>
              {images.length > 0 && !coverImage && (
                <button
                  type="button"
                  onClick={() => { setCoverImage(images[0]); setValue("coverImage", images[0]); }}
                  className="px-4 py-2 rounded-lg border border-white/10 bg-[#151922] text-[#F5F5F5] hover:border-white/20 text-sm"
                >
                  Utiliser la 1ère de la galerie
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9AA4B2] mb-2">Galerie (plusieurs images)</label>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border border-white/10 bg-[#151922] text-[#F5F5F5] hover:border-white/20 transition-colors">
                <Upload className="w-5 h-5" />
                {uploading ? "Upload en cours..." : "Ajouter une image"}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-6">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-[#151922] border border-white/10 relative">
                  <Image src={img} alt={`Image ${index + 1}`} fill className="object-cover" unoptimized />
                </div>
                <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/5 bg-[#111318] backdrop-blur-sm p-8">
        <h2 className="text-2xl font-bold text-[#F5F5F5] mb-6">Description</h2>
        <Textarea
          {...register("description")}
          error={errors.description?.message}
          placeholder="Description détaillée du véhicule..."
          rows={6}
          className="bg-[#151922] border-white/10 text-white placeholder:text-gray-500 focus:border-white/30 rounded-lg"
        />
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Enregistrement...
            </>
          ) : vehicle ? (
            "Mettre à jour"
          ) : (
            "Créer le véhicule"
          )}
        </Button>
      </div>
    </form>
  );
}

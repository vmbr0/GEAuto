"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Search, Loader2 } from "lucide-react";
import { VEHICLE_BRANDS, getBrandById } from "@/lib/vehicle-data";

const fuelTypeOptions = [
  { value: "", label: "Tous types" },
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

export default function VehicleSearchPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorSessionId, setErrorSessionId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    brandId: "",
    brand: "",
    model: "",
    year: "",
    mileage: "",
    fuelType: "",
    transmission: "",
    maxResults: "100",
    useProxy: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "brandId") {
      const brand = getBrandById(value);
      setFormData({
        ...formData,
        brandId: value,
        brand: brand?.id || "",
        model: "", // Reset model when brand changes
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const selectedBrand = formData.brandId ? getBrandById(formData.brandId) : null;
  const modelOptions = selectedBrand
    ? [
        { value: "", label: "Sélectionner un modèle" },
        ...selectedBrand.models.map((model) => ({ value: model, label: model })),
      ]
    : [{ value: "", label: "Sélectionnez d'abord une marque" }];

  const brandOptions = [
    { value: "", label: "Sélectionner une marque" },
    ...VEHICLE_BRANDS.map((brand) => ({ value: brand.id, label: brand.name })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!formData.brandId || !formData.model) {
        setError("Veuillez sélectionner une marque et un modèle");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/admin/scrape/mobile-de", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: formData.brandId,
          model: formData.model,
          year: formData.year ? parseInt(formData.year) : undefined,
          mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
          fuelType: formData.fuelType || undefined,
          transmission: formData.transmission || undefined,
          maxResults: formData.maxResults ? parseInt(formData.maxResults) : 100,
          useProxy: formData.useProxy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la recherche");
        setErrorSessionId(data.sessionId || null);
        setIsLoading(false);
        return;
      }

      setErrorSessionId(null);
      // Redirect to the results page with session ID
      router.push(`/admin/scrape-results/${data.sessionId}`);
    } catch (err) {
      setError("Une erreur est survenue");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Recherche mobile.de</h1>
        <p className="text-[#9AA4B2]">
          Recherchez des véhicules sur mobile.de et importez les résultats
        </p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#111318] backdrop-blur-sm p-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-950/50 border border-red-500/30 text-red-200 text-sm space-y-2">
            <p>{error}</p>
            {errorSessionId && (
              <a
                href={`/admin/scrape-results/${errorSessionId}`}
                className="inline-block text-sm font-medium text-amber-400 hover:text-amber-300 underline"
              >
                Voir la session de recherche →
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Marque *"
              options={brandOptions}
              value={formData.brandId}
              onChange={(e) => handleSelectChange("brandId", e.target.value)}
              required
              className="bg-[#151922] border-white/10 text-white [&>option]:bg-[#111318] focus:border-white/30"
            />
            <Select
              label="Modèle *"
              options={modelOptions}
              value={formData.model}
              onChange={(e) => handleSelectChange("model", e.target.value)}
              required
              disabled={!formData.brandId}
              className="bg-[#151922] border-white/10 text-white [&>option]:bg-[#111318] focus:border-white/30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Input
              label="Année"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              placeholder="Ex: 2020"
              min="1900"
              max={new Date().getFullYear() + 1}
              dark
            />
            <Input
              label="Kilométrage max (km)"
              name="mileage"
              type="number"
              value={formData.mileage}
              onChange={handleChange}
              placeholder="Ex: 50000"
              min="0"
              dark
            />
            <Select
              label="Type de carburant"
              options={fuelTypeOptions}
              value={formData.fuelType}
              onChange={(e) => handleSelectChange("fuelType", e.target.value)}
              className="bg-[#151922] border-white/10 text-white [&>option]:bg-[#111318] focus:border-white/30"
            />
            <Select
              label="Boîte de vitesse"
              options={transmissionOptions}
              value={formData.transmission}
              onChange={(e) => handleSelectChange("transmission", e.target.value)}
              className="bg-[#151922] border-white/10 text-white [&>option]:bg-[#111318] focus:border-white/30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nombre max de résultats"
              name="maxResults"
              type="number"
              value={formData.maxResults}
              onChange={handleChange}
              placeholder="100"
              min="1"
              max="500"
              dark
            />
            <div className="flex items-center gap-3 pt-8">
              <input
                type="checkbox"
                id="useProxy"
                checked={formData.useProxy}
                onChange={(e) => setFormData({ ...formData, useProxy: e.target.checked })}
                className="w-5 h-5 rounded border-white/10 bg-[#151922] text-white focus:border-white/30"
              />
              <label htmlFor="useProxy" className="text-sm font-medium text-[#F5F5F5]">
                Utiliser les proxies Tor (recommandé pour éviter les blocages)
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-[#151922] p-4">
            <p className="text-sm text-[#9AA4B2]">
              <strong className="text-[#F5F5F5]">Note:</strong> La recherche peut prendre quelques minutes selon le nombre de résultats demandés. 
              Les résultats seront sauvegardés et disponibles dans les résultats de scraping.
              {formData.useProxy && (
                <span className="block mt-2">
                  <strong className="text-[#F5F5F5]">Proxies Tor activés:</strong> Lancez Tor (Tor Browser ou service tor sur le port 9050) avant de lancer la recherche. Sans Tor, décochez cette option (mobile.de peut alors afficher un captcha).
                </span>
              )}
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            fullWidth
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Recherche en cours...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Lancer la recherche
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

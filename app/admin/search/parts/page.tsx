"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Search, Loader2 } from "lucide-react";

export default function PartsSearchPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    query: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/scrape/allegro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: formData.query,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la recherche");
        setIsLoading(false);
        return;
      }

      router.push(`/admin/scrape-results?type=parts&count=${data.count}`);
    } catch (err) {
      setError("Une erreur est survenue");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <header className="mb-10">
        <p className="text-sm text-[#6B7280] mb-1">Admin</p>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-2">
          Recherche Allegro.pl
        </h1>
        <p className="text-[#9AA4B2]">
          Recherchez des pièces automobiles sur Allegro.pl (Pologne)
        </p>
      </header>

      <div className="rounded-2xl border border-white/5 bg-[#111318] backdrop-blur-sm p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Recherche (en français) *"
            name="query"
            value={formData.query}
            onChange={handleChange}
            required
            placeholder="Ex: phare avant BMW série 3"
            helperText="La recherche sera automatiquement traduite en polonais"
            dark
          />

          <div className="rounded-xl border border-white/10 bg-[#151922] p-4">
            <p className="text-sm text-[#9AA4B2]">
              <strong className="text-[#F5F5F5]">Note:</strong> La recherche peut prendre quelques minutes.
              La traduction en polonais est automatique via LibreTranslate.
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

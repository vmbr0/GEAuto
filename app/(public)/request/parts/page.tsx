"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Package,
  Search,
  Euro,
  Shield,
  Box,
  Calendar,
  Hash,
  FileText,
} from "lucide-react";
import {
  PremiumInput,
  PremiumTextarea,
} from "@/components/request/FormFieldWithIcon";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { partsRequestSchema } from "@/lib/validations/requests";

const BULLETS = [
  {
    icon: Search,
    text: "Recherche multi-pays (Pologne, Allemagne, Europe)",
  },
  {
    icon: Euro,
    text: "Prix négociés, économies jusqu’à 50 % sur de nombreuses pièces",
  },
  {
    icon: Shield,
    text: "Commission transparente, prix final clair dès le départ",
  },
];

export default function PartsRequestPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    partName: "",
    vehicleModel: "",
    year: "",
    vin: "",
    budget: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsLoading(true);

    if (!session) {
      router.push("/auth/login?callbackUrl=/request/parts");
      return;
    }

    try {
      const submitData = {
        partName: formData.partName,
        vehicleModel: formData.vehicleModel || null,
        year: formData.year ? parseInt(formData.year) : null,
        vin: formData.vin || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        notes: formData.notes || null,
      };

      partsRequestSchema.parse(submitData);

      const response = await fetch("/api/requests/parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          const errors: Record<string, string> = {};
          data.details.forEach((err: { path: string[]; message: string }) => {
            errors[err.path[0]] = err.message;
          });
          setFieldErrors(errors);
        } else {
          setError(data.error || "Une erreur est survenue");
        }
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/requests");
      }, 2000);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "name" in err &&
        err.name === "ZodError"
      ) {
        const zodErr = err as unknown as {
          errors: { path: (string | number)[]; message: string }[];
        };
        const errors: Record<string, string> = {};
        zodErr.errors.forEach((error) => {
          const path = error.path[0];
          if (typeof path === "string") errors[path] = error.message;
        });
        setFieldErrors(errors);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-base">
        <section className="section-vertical-rhythm">
          <div className="max-w-xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl glass border border-white/10 p-8 text-center"
            >
              <Alert
                variant="success"
                className="mb-0 border-0 bg-emerald-500/20 text-emerald-200"
              >
                Demande créée avec succès ! Redirection vers votre dashboard...
              </Alert>
            </motion.div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base">
      {/* Hero */}
      <section className="relative section-full section-vertical-rhythm bg-base-darker overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 w-full px-6 sm:px-10 md:px-14 lg:px-20">
          <RevealOnScroll>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight max-w-3xl">
              Trouvez vos pièces en Europe
            </h1>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <p className="mt-4 text-lg md:text-xl text-zinc-300 max-w-2xl">
              Sourcing à prix compétitifs dans toute l’Europe.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Split layout */}
      <section className="section-full section-vertical-rhythm">
        <div className="w-full px-6 sm:px-10 md:px-14 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left – icon, explanation, bullets */}
            <div className="order-2 lg:order-1">
              <RevealOnScroll>
                <motion.div
                  className="w-24 h-24 rounded-2xl bg-accent/20 flex items-center justify-center mb-8"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Package className="w-12 h-12 text-accent" />
                </motion.div>
              </RevealOnScroll>
              <RevealOnScroll delay={0.1}>
                <p className="text-zinc-300 text-lg leading-relaxed max-w-md mb-10">
                  Décrivez la pièce dont vous avez besoin. Nous la recherchons
                  sur Allegro, nos fournisseurs allemands et ailleurs en Europe
                  pour vous proposer le meilleur rapport qualité-prix.
                </p>
              </RevealOnScroll>
              <ul className="space-y-5">
                {BULLETS.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <RevealOnScroll key={i} delay={0.15 + i * 0.05}>
                      <li className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-accent" />
                        </span>
                        <span className="text-zinc-300 pt-1">{item.text}</span>
                      </li>
                    </RevealOnScroll>
                  );
                })}
              </ul>
            </div>

            {/* Right – glass form */}
            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="rounded-2xl glass border border-white/10 p-6 md:p-8 shadow-xl">
                {error && (
                  <Alert
                    variant="error"
                    className="mb-6 border-red-500/30 bg-red-500/10 text-red-200"
                  >
                    {error}
                  </Alert>
                )}
                {!session && (
                  <Alert
                    variant="info"
                    className="mb-6 border-white/20 bg-white/5 text-zinc-300"
                  >
                    Vous devez être connecté pour créer une demande.{" "}
                    <Link
                      href="/auth/login?callbackUrl=/request/parts"
                      className="underline font-medium text-accent hover:text-accent/90"
                    >
                      Se connecter
                    </Link>
                  </Alert>
                )}

                <div className="flex items-center gap-2 mb-8">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Formulaire
                  </span>
                  <span className="text-zinc-500">·</span>
                  <span className="text-sm text-zinc-300">Étapes 1 à 3</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Step 1 – Pièce */}
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-5">
                      Pièce recherchée
                    </h3>
                    <div className="space-y-5">
                      <PremiumInput
                        icon={<Package className="w-5 h-5" />}
                        label="Nom de la pièce *"
                        name="partName"
                        value={formData.partName}
                        onChange={handleChange}
                        error={fieldErrors.partName}
                        required
                        placeholder="Ex: Phare avant gauche"
                        staggerIndex={0}
                      />
                      <p className="text-sm text-zinc-400 -mt-2">
                        Décrivez précisément la pièce recherchée.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 – Véhicule */}
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-5">
                      Véhicule concerné
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <PremiumInput
                        icon={<Box className="w-5 h-5" />}
                        label="Modèle du véhicule"
                        name="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={handleChange}
                        error={fieldErrors.vehicleModel}
                        placeholder="Ex: BMW Série 3 E90"
                        staggerIndex={1}
                      />
                      <PremiumInput
                        icon={<Calendar className="w-5 h-5" />}
                        label="Année"
                        name="year"
                        type="number"
                        value={formData.year}
                        onChange={handleChange}
                        error={fieldErrors.year}
                        placeholder="Ex: 2010"
                        staggerIndex={2}
                      />
                      <PremiumInput
                        icon={<Hash className="w-5 h-5" />}
                        label="VIN (numéro de série)"
                        name="vin"
                        value={formData.vin}
                        onChange={handleChange}
                        error={fieldErrors.vin}
                        placeholder="Ex: WBA3A5C58EK123456"
                        maxLength={17}
                        staggerIndex={3}
                      />
                    </div>
                    <p className="text-sm text-zinc-400 mt-2">
                      Optionnel mais recommandé pour une recherche précise.
                    </p>
                  </div>

                  {/* Step 3 – Budget & notes */}
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-5">
                      Budget & notes
                    </h3>
                    <div className="space-y-5">
                      <PremiumInput
                        icon={<Euro className="w-5 h-5" />}
                        label="Budget maximum (€)"
                        name="budget"
                        type="number"
                        step="0.01"
                        value={formData.budget}
                        onChange={handleChange}
                        error={fieldErrors.budget}
                        placeholder="Ex: 500"
                        staggerIndex={4}
                      />
                      <PremiumTextarea
                        icon={<FileText className="w-5 h-5" />}
                        label="Notes supplémentaires"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        error={fieldErrors.notes}
                        rows={4}
                        placeholder="Informations complémentaires, état souhaité, urgence, etc."
                        staggerIndex={5}
                      />
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-sm text-zinc-300">
                        <strong className="text-zinc-300">Note :</strong> Vous
                        pouvez télécharger une photo de la pièce après la
                        création de la demande depuis votre dashboard.
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-4">
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                        disabled={!session}
                        fullWidth
                        className="py-4 text-lg font-semibold shadow-glow hover:shadow-glow-strong"
                      >
                        Créer la demande
                      </Button>
                    </motion.div>
                    <Link
                      href="/dashboard"
                      className="mt-4 block text-center text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      Annuler
                    </Link>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}

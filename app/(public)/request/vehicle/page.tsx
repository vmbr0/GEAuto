"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Car,
  Target,
  Shield,
  Zap,
  Tag,
  Box,
  Calendar,
  Gauge,
  Fuel,
  Cog,
  Palette,
  Euro,
  FileText,
} from "lucide-react";
import { PremiumInput, PremiumSelect, PremiumTextarea } from "@/components/request/FormFieldWithIcon";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { vehicleRequestSchema } from "@/lib/validations/requests";
import { FuelType, Transmission } from "@prisma/client";

const fuelTypeOptions = [
  { value: "", label: "Tous types" },
  { value: FuelType.PETROL, label: "Essence" },
  { value: FuelType.DIESEL, label: "Diesel" },
  { value: FuelType.ELECTRIC, label: "Électrique" },
  { value: FuelType.HYBRID, label: "Hybride" },
  { value: FuelType.PLUGIN_HYBRID, label: "Hybride rechargeable" },
];

const transmissionOptions = [
  { value: "", label: "Toutes" },
  { value: Transmission.MANUAL, label: "Manuelle" },
  { value: Transmission.AUTOMATIC, label: "Automatique" },
  { value: Transmission.CVT, label: "CVT" },
];

const BULLETS = [
  {
    icon: Target,
    text: "Recherche ciblée sur les meilleures plateformes européennes",
  },
  {
    icon: Shield,
    text: "Négociation et démarches administratives gérées pour vous",
  },
  {
    icon: Zap,
    text: "Livraison clé en main en France",
  },
];

export default function VehicleRequestPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    yearMin: "",
    yearMax: "",
    mileageMin: "",
    mileageMax: "",
    fuelType: "",
    transmission: "",
    color: "",
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

  const handleSelectChange = (name: string, value: string) => {
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
      router.push("/auth/login?callbackUrl=/request/vehicle");
      return;
    }

    try {
      const submitData = {
        brand: formData.brand,
        model: formData.model,
        yearMin: formData.yearMin ? parseInt(formData.yearMin) : null,
        yearMax: formData.yearMax ? parseInt(formData.yearMax) : null,
        mileageMin: formData.mileageMin ? parseInt(formData.mileageMin) : null,
        mileageMax: formData.mileageMax ? parseInt(formData.mileageMax) : null,
        fuelType: formData.fuelType || null,
        transmission: formData.transmission || null,
        color: formData.color || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        notes: formData.notes || null,
      };

      vehicleRequestSchema.parse(submitData);

      const response = await fetch("/api/requests/vehicle", {
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
      if (err && typeof err === "object" && "name" in err && err.name === "ZodError") {
        const zodErr = err as unknown as { errors: { path: (string | number)[]; message: string }[] };
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
      {/* Hero – full-width dark, title + subtitle, fade-in */}
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
              Configurez votre véhicule idéal
            </h1>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <p className="mt-4 text-lg md:text-xl text-zinc-300 max-w-2xl">
              Nous trouvons les meilleures opportunités en Europe.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Split layout: left = icon + bullets, right = glass form */}
      <section className="section-full section-vertical-rhythm">
        <div className="w-full px-6 sm:px-10 md:px-14 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left – animated icon, explanation, bullets */}
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
                  <Car className="w-12 h-12 text-accent" />
                </motion.div>
              </RevealOnScroll>
              <RevealOnScroll delay={0.1}>
                <p className="text-zinc-300 text-lg leading-relaxed max-w-md mb-10">
                  Décrivez le véhicule que vous recherchez. Notre équipe le
                  sourcera en Europe, négociera et gérera l’import jusqu’à la
                  livraison en France.
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

            {/* Right – dark glass form container */}
            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
                      href="/auth/login?callbackUrl=/request/vehicle"
                      className="underline font-medium text-accent hover:text-accent/90"
                    >
                      Se connecter
                    </Link>
                  </Alert>
                )}

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-8">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Formulaire
                  </span>
                  <span className="text-zinc-500">·</span>
                  <span className="text-sm text-zinc-300">
                    Étapes 1 à 3
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Step 1 – Vehicle basics */}
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-5">
                      Véhicule
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <PremiumInput
                        icon={<Tag className="w-5 h-5" />}
                        label="Marque *"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        error={fieldErrors.brand}
                        required
                        placeholder="Ex: BMW"
                        staggerIndex={0}
                      />
                      <PremiumInput
                        icon={<Box className="w-5 h-5" />}
                        label="Modèle *"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        error={fieldErrors.model}
                        required
                        placeholder="Ex: Série 3"
                        staggerIndex={1}
                      />
                      <PremiumInput
                        icon={<Calendar className="w-5 h-5" />}
                        label="Année min"
                        name="yearMin"
                        type="number"
                        value={formData.yearMin}
                        onChange={handleChange}
                        error={fieldErrors.yearMin}
                        placeholder="Ex: 2018"
                        staggerIndex={2}
                      />
                      <PremiumInput
                        icon={<Calendar className="w-5 h-5" />}
                        label="Année max"
                        name="yearMax"
                        type="number"
                        value={formData.yearMax}
                        onChange={handleChange}
                        error={fieldErrors.yearMax}
                        placeholder="Ex: 2023"
                        staggerIndex={3}
                      />
                      <PremiumInput
                        icon={<Gauge className="w-5 h-5" />}
                        label="Kilométrage min (km)"
                        name="mileageMin"
                        type="number"
                        value={formData.mileageMin}
                        onChange={handleChange}
                        error={fieldErrors.mileageMin}
                        placeholder="Ex: 0"
                        staggerIndex={4}
                      />
                      <PremiumInput
                        icon={<Gauge className="w-5 h-5" />}
                        label="Kilométrage max (km)"
                        name="mileageMax"
                        type="number"
                        value={formData.mileageMax}
                        onChange={handleChange}
                        error={fieldErrors.mileageMax}
                        placeholder="Ex: 50000"
                        staggerIndex={5}
                      />
                    </div>
                  </div>

                  {/* Step 2 – Preferences */}
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-5">
                      Préférences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <PremiumSelect
                        icon={<Fuel className="w-5 h-5" />}
                        label="Carburant"
                        options={fuelTypeOptions}
                        value={formData.fuelType}
                        onChange={(e) =>
                          handleSelectChange("fuelType", e.target.value)
                        }
                        error={fieldErrors.fuelType}
                        staggerIndex={6}
                      />
                      <PremiumSelect
                        icon={<Cog className="w-5 h-5" />}
                        label="Transmission"
                        options={transmissionOptions}
                        value={formData.transmission}
                        onChange={(e) =>
                          handleSelectChange("transmission", e.target.value)
                        }
                        error={fieldErrors.transmission}
                        staggerIndex={7}
                      />
                      <PremiumInput
                        icon={<Palette className="w-5 h-5" />}
                        label="Couleur"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        error={fieldErrors.color}
                        placeholder="Ex: Noir"
                        staggerIndex={8}
                      />
                    </div>
                  </div>

                  {/* Step 3 – Budget & notes */}
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-5">
                      Budget & notes
                    </h3>
                    <div className="space-y-5">
                      <PremiumInput
                        icon={<Euro className="w-5 h-5" />}
                        label="Budget (€)"
                        name="budget"
                        type="number"
                        step="0.01"
                        value={formData.budget}
                        onChange={handleChange}
                        error={fieldErrors.budget}
                        placeholder="Ex: 25000"
                        staggerIndex={9}
                      />
                      <PremiumTextarea
                        icon={<FileText className="w-5 h-5" />}
                        label="Notes supplémentaires"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        error={fieldErrors.notes}
                        rows={4}
                        placeholder="Décrivez vos préférences, options souhaitées, etc."
                        staggerIndex={10}
                      />
                    </div>
                  </div>

                  {/* CTA – large, full width, glow */}
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

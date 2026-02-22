"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { registerSchema } from "@/lib/validations/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear field error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsLoading(true);

    try {
      // Validate with Zod
      registerSchema.parse(formData);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          const errors: Record<string, string> = {};
          data.details.forEach((error: any) => {
            errors[error.path[0]] = error.message;
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
        router.push("/auth/login?registered=true");
      }, 2000);
    } catch (err: any) {
      if (err.name === "ZodError") {
        const errors: Record<string, string> = {};
        err.errors.forEach((error: any) => {
          errors[error.path[0]] = error.message;
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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
        <div className="absolute inset-0 bg-[var(--bg-base)]" aria-hidden />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 20%, var(--hover-surface) 0%, transparent 50%), linear-gradient(180deg, var(--bg-darker) 0%, var(--bg-base) 40%, var(--bg-elevated) 100%)",
          }}
          aria-hidden
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "relative rounded-2xl p-8 sm:p-10",
            "bg-[var(--bg-glass)] backdrop-blur-xl",
            "border border-[var(--border-subtle)]",
            "shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_48px_-12px_rgba(0,0,0,0.5)]"
          )}
        >
          <Alert variant="success" className="mb-4 text-green-200">
            Compte créé avec succès ! Redirection...
          </Alert>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-[var(--bg-base)]" aria-hidden />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 20%, var(--hover-surface) 0%, transparent 50%), linear-gradient(180deg, var(--bg-darker) 0%, var(--bg-base) 40%, var(--bg-elevated) 100%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 pointer-events-none login-shimmer"
        style={{
          background: `linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)`,
        }}
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[420px]"
      >
        <div
          className={cn(
            "rounded-2xl p-8 sm:p-10",
            "bg-[var(--bg-glass)] backdrop-blur-xl",
            "border border-[var(--border-subtle)]",
            "shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_48px_-12px_rgba(0,0,0,0.5)]"
          )}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--hover-surface)] border border-[var(--border-subtle)] px-4 py-2.5 mb-6">
              <span className="text-white font-bold text-lg tracking-tight">GE</span>
              <span className="text-white font-semibold text-lg tracking-tight">Auto Import</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Créez votre compte
            </h1>
            <p className="text-sm text-white/90">Inscrivez-vous pour accéder à votre espace</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-400/30 text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nom complet"
              type="text"
              name="name"
              placeholder="Jean Dupont"
              value={formData.name}
              onChange={handleChange}
              error={fieldErrors.name}
              disabled={isLoading}
              autoComplete="name"
              dark
            />
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleChange}
              error={fieldErrors.email}
              disabled={isLoading}
              autoComplete="email"
              dark
            />
            <Input
              label="Mot de passe"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={fieldErrors.password}
              disabled={isLoading}
              autoComplete="new-password"
              dark
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={fieldErrors.confirmPassword}
              disabled={isLoading}
              autoComplete="new-password"
              dark
            />

            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full mt-6">
              Créer mon compte
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white">
              Déjà un compte ?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-white hover:text-white/80 underline underline-offset-2"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

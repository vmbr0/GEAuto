"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { loginSchema } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    setIsLoading(true);

    try {
      loginSchema.parse({ email, password });

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const msg = result.error;
        setError(
          msg.includes("désactivé")
            ? msg
            : process.env.NODE_ENV === "development" && msg
              ? msg
              : "Email ou mot de passe incorrect"
        );
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        router.refresh();
        router.replace("/dashboard");
        return;
      }
      if (!result) {
        setError(
          "Erreur de connexion. Vérifiez que NEXTAUTH_URL et NEXTAUTH_SECRET sont définis."
        );
      }
      setIsLoading(false);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "name" in err && err.name === "ZodError" && "errors" in err) {
        const errors: Record<string, string> = {};
        (err as { errors: Array<{ path: string[]; message: string }> }).errors.forEach(
          (e) => {
            errors[e.path[0]] = e.message;
          }
        );
        setFieldErrors(errors);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
      setIsLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Fullscreen dark cinematic background */}
      <div
        className="absolute inset-0 bg-[var(--bg-base)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 20%, var(--hover-surface) 0%, transparent 50%), linear-gradient(180deg, var(--bg-darker) 0%, var(--bg-base) 40%, var(--bg-elevated) 100%)",
        }}
        aria-hidden
      />
      {/* Subtle animated gradient overlay */}
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
        <Link
          href="/"
          className="absolute -top-2 left-0 flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors z-10"
        >
          ← Retour à l&apos;accueil
        </Link>
        {/* Centered glass card */}
        <div
          className={cn(
            "rounded-2xl p-8 sm:p-10",
            "bg-[var(--bg-glass)] backdrop-blur-xl",
            "border border-[var(--border-subtle)]",
            "shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_48px_-12px_rgba(0,0,0,0.5)]"
          )}
        >
          {/* Logo section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-8"
          >
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="GE Auto Import"
                width={180}
                height={63}
                className="h-12 w-auto object-contain mx-auto"
              />
            </Link>
          </motion.div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
              Connexion à votre espace
            </h1>
            <p className="text-sm sm:text-base text-white/80">
              Accédez à votre plateforme GE Auto Import
            </p>
          </div>

          {/* Error message - dark theme */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-400/30 text-red-200 text-sm"
              role="alert"
            >
              {error}
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit}
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-5"
          >
            {/* Email field with icon */}
            <motion.div variants={item} className="space-y-2">
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                Email
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                  aria-hidden
                >
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                  }}
                  disabled={isLoading}
                  autoComplete="email"
                  className={cn(
                    "w-full h-12 pl-12 pr-4 rounded-xl border bg-[var(--bg-elevated)]/80",
                    "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
                    "transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/30 focus:border-[var(--border-subtle)]",
                    "border-[var(--border-subtle)] hover:border-white/10",
                    fieldErrors.email && "border-red-400/50 focus:ring-red-400/40"
                  )}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-red-300" role="alert">
                  {fieldErrors.email}
                </p>
              )}
            </motion.div>

            {/* Password field with icon */}
            <motion.div variants={item} className="space-y-2">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                Mot de passe
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                  aria-hidden
                >
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                  }}
                  disabled={isLoading}
                  autoComplete="current-password"
                  className={cn(
                    "w-full h-12 pl-12 pr-4 rounded-xl border bg-[var(--bg-elevated)]/80",
                    "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
                    "transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/30 focus:border-[var(--border-subtle)]",
                    "border-[var(--border-subtle)] hover:border-white/10",
                    fieldErrors.password && "border-red-400/50 focus:ring-red-400/40"
                  )}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-red-300" role="alert">
                  {fieldErrors.password}
                </p>
              )}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </motion.div>

            {/* Submit button */}
            <motion.div variants={item}>
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full h-12 rounded-xl font-medium text-[var(--bg-base)]",
                  "bg-[var(--text-primary)] text-[var(--bg-base)] hover:bg-[var(--text-secondary)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/40 focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]",
                  "transition-all duration-200 active:scale-[0.98]",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "border border-[var(--border-subtle)]"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>
            </motion.div>
          </motion.form>

          {/* Register link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-6 text-center text-sm text-white"
          >
            Pas encore de compte ?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-white hover:text-white/80 underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)]/30 focus:ring-offset-2 focus:ring-offset-[var(--bg-glass)] rounded"
            >
              Créer un compte
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

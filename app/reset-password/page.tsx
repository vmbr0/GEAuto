"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("Lien invalide : token manquant.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères (majuscule, minuscule, chiffre).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
          confirmNewPassword: confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de la réinitialisation");
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111318] p-8 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Mot de passe réinitialisé</h1>
          <p className="text-white/70 text-sm mb-6">
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
          <Link href="/auth/login">
            <Button variant="primary" fullWidth>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Aller à la connexion
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111318] p-8"
      >
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <h1 className="text-xl font-bold text-white mb-2">Nouveau mot de passe</h1>
        <p className="text-white/70 text-sm mb-6">
          Choisissez un mot de passe d’au moins 8 caractères (majuscule, minuscule, chiffre).
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-400 text-sm rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
              {error}
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white placeholder:text-white/40"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white placeholder:text-white/40"
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading || !token}
          >
            {loading ? "Enregistrement..." : "Réinitialiser le mot de passe"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <p className="text-white/60">Chargement...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

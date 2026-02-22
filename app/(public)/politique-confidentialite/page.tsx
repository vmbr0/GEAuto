import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité - GE Auto Import",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="container-custom py-16 max-w-3xl">
        <Link href="/" className="inline-block text-zinc-400 hover:text-white text-sm mb-8">
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-8">Politique de confidentialité</h1>
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300">
          <p><strong className="text-white">Responsable du traitement</strong><br />GE Auto Import – contact@geautoimport.fr</p>
          <p><strong className="text-white">Données collectées</strong><br />Nous collectons les données nécessaires à la gestion de vos demandes (nom, prénom, email, téléphone) et à la fourniture de nos services.</p>
          <p><strong className="text-white">Finalité</strong><br />Traitement des demandes d&apos;import véhicules et pièces, prise de rendez-vous, suivi des dossiers et relation client.</p>
          <p><strong className="text-white">Cookies</strong><br />Le site peut utiliser des cookies pour le bon fonctionnement de la session et de l&apos;authentification. Vous pouvez gérer les préférences dans les paramètres de votre navigateur.</p>
          <p><strong className="text-white">Vos droits</strong><br />Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. Contact : contact@geautoimport.fr</p>
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "CGV - GE Auto Import",
};

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="container-custom py-16 max-w-3xl">
        <Link href="/" className="inline-block text-zinc-400 hover:text-white text-sm mb-8">
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-8">Conditions générales de vente</h1>
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300">
          <p><strong className="text-white">Préambule</strong><br />Les présentes conditions générales de vente (CGV) s&apos;appliquent aux prestations proposées par GE Auto Import.</p>
          <p><strong className="text-white">Contact</strong><br />Email : contact@geautoimport.fr</p>
          <p>En passant commande ou en utilisant nos services, vous acceptez les présentes CGV. Nous vous invitons à les consulter avant toute démarche.</p>
        </div>
      </div>
    </main>
  );
}

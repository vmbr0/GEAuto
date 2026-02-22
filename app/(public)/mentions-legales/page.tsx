import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales - GE Auto Import",
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-white">
      <div className="container-custom py-16 max-w-3xl">
        <Link href="/" className="inline-block text-zinc-400 hover:text-white text-sm mb-8">
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-8">Mentions légales</h1>
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300">
          <p><strong className="text-white">Éditeur du site</strong><br />GE Auto Import</p>
          <p><strong className="text-white">Hébergeur</strong><br />À compléter (hébergeur du site)</p>
          <p><strong className="text-white">Contact</strong><br />Email : contact@geautoimport.fr</p>
          <p>Conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique (LCEN), les présentes mentions légales précisent l&apos;identité des différents intervenants dans le cadre de la réalisation et du suivi de ce site.</p>
        </div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import ServiceBlock from "@/components/home/ServiceBlock";

const SERVICES_DATA = [
  {
    id: "resale",
    title: "Vente de véhicules",
    description:
      "Nous achetons des véhicules en Europe (principalement en Allemagne via mobile.de) et les revendons en France avec garantie et conformité totale.",
    bullets: [
      "Recherche personnalisée",
      "Prix compétitifs",
      "Garantie qualité",
      "Suivi en temps réel",
    ],
    ctaLabel: "Voir les véhicules disponibles",
    ctaHref: "/inventory",
    imageSrc:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80",
    imageAlt: "Véhicules premium à la vente",
    imageLeft: true,
  },
  {
    id: "import",
    title: "Import personnalisé",
    description:
      "Vous recherchez un véhicule spécifique ? Nous le trouvons pour vous en Europe, gérons la négociation, les démarches administratives et la logistique.",
    bullets: [
      "Recherche ciblée sur mobile.de et plateformes européennes",
      "Négociation professionnelle pour le meilleur prix",
      "Gestion complète : paperasse, logistique, livraison en France",
    ],
    ctaLabel: "Créer une demande",
    ctaHref: "/request/vehicle",
    imageSrc:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1200&q=80",
    imageAlt: "Import automobile sur mesure",
    imageLeft: false,
  },
  {
    id: "parts",
    title: "Sourcing de pièces",
    description:
      "Pièces automobiles à prix réduit dans toute l'Europe. Recherche sur allegro.pl (Pologne) et autres fournisseurs européens.",
    bullets: [
      "Recherche multi-pays (Pologne, Allemagne, Europe)",
      "Prix compétitifs — économies jusqu'à 50 % sur certaines pièces",
      "Commission transparente, prix final clair dès le départ",
    ],
    ctaLabel: "Demander des pièces",
    ctaHref: "/request/parts",
    imageSrc:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80",
    imageAlt: "Sourcing de pièces automobiles",
    imageLeft: true,
  },
];

export default function ServicesPage() {
  return (
    <main className="section-full">
      {/* Hero – full width, dark, large typography */}
      <section className="section-full section-vertical-rhythm bg-base flex flex-col justify-center">
        <div className="w-full px-6 sm:px-10 md:px-14 lg:px-20">
          <RevealOnScroll>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight max-w-4xl">
              Nos Services
            </h1>
          </RevealOnScroll>
          <RevealOnScroll delay={0.15}>
            <p className="mt-6 text-xl md:text-2xl text-zinc-300 max-w-2xl leading-relaxed">
              Trois services premium pour répondre à tous vos besoins en import
              automobile.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Service blocks – full width, 50/50, alternating */}
      {SERVICES_DATA.map((service) => (
        <ServiceBlock
          key={service.id}
          id={service.id}
          title={service.title}
          description={service.description}
          bullets={service.bullets}
          ctaLabel={service.ctaLabel}
          ctaHref={service.ctaHref}
          imageSrc={service.imageSrc}
          imageAlt={service.imageAlt}
          imageLeft={service.imageLeft}
        />
      ))}

      {/* Final CTA – coherence with rest of site */}
      <section className="section-full section-vertical-rhythm bg-base-darker flex flex-col items-center justify-center text-center px-6">
        <RevealOnScroll>
          <p className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-white tracking-tight max-w-2xl mb-10">
            Un projet précis en tête ?
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}>
          <Link href="/request/vehicle">
            <Button size="lg" variant="primary">
              Demander un véhicule
            </Button>
          </Link>
        </RevealOnScroll>
      </section>
    </main>
  );
}

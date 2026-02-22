"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import ScrollIndicator from "@/components/ui/ScrollIndicator";
import { StatBlock } from "@/components/ui/AnimatedCounter";
import ServiceBlock from "@/components/home/ServiceBlock";

/* Hero background: replace with your own high-quality asset */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=85";

const SERVICES = [
  {
    title: "Vente de véhicules",
    description:
      "Véhicules sélectionnés en Europe, livrés en France. Qualité et garantie.",
    bullets: ["Contrôle qualité", "Garantie", "Livraison clé en main"],
    ctaLabel: "Voir le stock",
    ctaHref: "/inventory",
    imageSrc:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80",
    imageAlt: "Véhicules premium",
    imageLeft: true,
  },
  {
    title: "Import personnalisé",
    description:
      "Nous trouvons et importons le véhicule que vous cherchez, de A à Z.",
    bullets: ["Recherche sur mesure", "Négociation", "Démarches administratives"],
    ctaLabel: "Demander un véhicule",
    ctaHref: "/request/vehicle",
    imageSrc:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1200&q=80",
    imageAlt: "Import automobile",
    imageLeft: false,
  },
  {
    title: "Sourcing de pièces",
    description:
      "Pièces automobiles sourcées en Europe, à des prix compétitifs.",
    bullets: ["Large réseau", "Prix négociés", "Traçabilité"],
    ctaLabel: "Demander des pièces",
    ctaHref: "/request/parts",
    imageSrc:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80",
    imageAlt: "Pièces automobiles",
    imageLeft: true,
  },
];

export default function HomePage() {
  return (
    <main className="section-full">
      {/* ========== SECTION 1 – FULLSCREEN HERO ========== */}
      <section className="relative min-h-screen w-full flex flex-col justify-end md:justify-center overflow-hidden">
        {/* Background image with slight parallax */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Dark overlay gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,10,13,0.4) 0%, rgba(7,10,13,0.7) 50%, rgba(11,15,20,0.98) 100%)",
          }}
        />

        {/* Content – no boxed layout, full width with padding */}
        <div className="relative z-10 w-full px-6 sm:px-10 md:px-14 lg:px-20 pb-32 md:pb-24 pt-32">
          <div className="max-w-4xl">
            <motion.div
              className="mb-4 flex items-center"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/logo.png"
                alt="GE Auto Import - Grand Est"
                width={560}
                height={196}
                className="h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96 w-auto object-contain"
                priority
              />
            </motion.div>
            <motion.h1
              className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white tracking-tight leading-[1.05]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Import automobile
              <br />
              <span className="text-accent">premium</span>
            </motion.h1>
            <motion.p
              className="mt-4 text-lg md:text-xl text-zinc-200 max-w-xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              Votre partenaire pour l'import de véhicules et de pièces depuis
              l'Europe.
            </motion.p>
            <motion.div
              className="mt-10 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/request/vehicle">
                <Button size="lg" variant="primary">
                  Demander un véhicule
                </Button>
              </Link>
              <Link href="/request/parts">
                <Button size="lg" variant="outline">
                  Demander des pièces
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        <ScrollIndicator />
      </section>

      {/* ========== SECTION 2 – BRAND STATEMENT ========== */}
      <section className="section-full section-vertical-rhythm bg-base flex items-center justify-center">
        <RevealOnScroll>
          <p className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white text-center tracking-tight leading-tight max-w-5xl mx-auto px-6">
            Nous trouvons les meilleures opportunités automobiles en Europe.
          </p>
        </RevealOnScroll>
      </section>

      {/* ========== SECTION 3 – SERVICES (FULL BLOCKS) ========== */}
      {SERVICES.map((service) => (
        <ServiceBlock
          key={service.title}
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

      {/* ========== SECTION 4 – MARKET EXPERTISE ========== */}
      <section className="section-full section-vertical-rhythm bg-base-darker">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 w-full max-w-5xl mx-auto px-6 sm:px-10">
          <StatBlock
            value={28}
            suffix=" %"
            label="Économie moyenne"
            delay={0}
          />
          <StatBlock
            value={1200}
            suffix="+"
            label="Véhicules sourcés"
            delay={0.15}
          />
          <StatBlock
            value={98}
            suffix=" %"
            label="Clients satisfaits"
            delay={0.3}
          />
        </div>
      </section>

      {/* ========== SECTION 5 – FINAL CTA ========== */}
      <section className="section-full section-vertical-rhythm bg-base flex flex-col items-center justify-center text-center px-6">
        <RevealOnScroll>
          <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight max-w-4xl mx-auto mb-12">
            Prêt à concrétiser votre projet ?
          </h2>
        </RevealOnScroll>
        <RevealOnScroll delay={0.15}>
          <Link href="/auth/register">
            <Button size="lg" variant="primary">
              Créer un compte
            </Button>
          </Link>
        </RevealOnScroll>
      </section>
    </main>
  );
}

"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { cn } from "@/lib/utils";

interface ServiceBlockProps {
  title: string;
  description: string;
  bullets?: string[];
  ctaLabel: string;
  ctaHref: string;
  imageSrc: string;
  imageAlt: string;
  /** true = image left, text right; false = text left, image right */
  imageLeft: boolean;
  /** Optional section id for deep linking (e.g. #import) */
  id?: string;
}

export default function ServiceBlock({
  title,
  description,
  bullets = [],
  ctaLabel,
  ctaHref,
  imageSrc,
  imageAlt,
  imageLeft,
  id,
}: ServiceBlockProps) {
  const imageBlock = (
    <motion.div
      className="relative h-[50vh] min-h-[320px] md:h-full md:min-h-[60vh] w-full overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${imageSrc})` }}
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-base via-base/40 to-transparent md:from-transparent md:via-transparent",
          imageLeft && "md:bg-gradient-to-r md:from-base/80 md:via-base/30",
          !imageLeft && "md:bg-gradient-to-l md:from-base/80 md:via-base/30"
        )}
      />
    </motion.div>
  );

  const textBlock = (
    <div className="flex flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-20 py-16 md:py-24">
      <RevealOnScroll delay={0.1}>
        <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-white tracking-tight mb-6">
          {title}
        </h2>
      </RevealOnScroll>
      <RevealOnScroll delay={0.2}>
        <p className="text-zinc-200 text-lg md:text-xl leading-relaxed max-w-xl mb-8">
          {description}
        </p>
      </RevealOnScroll>
      {bullets.length > 0 && (
        <RevealOnScroll delay={0.3}>
          <ul className="space-y-2 mb-10">
            {bullets.map((bullet, i) => (
              <li
                key={i}
                className="text-zinc-300 flex items-center gap-2 text-base md:text-lg"
              >
                <span className="w-1 h-1 rounded-full bg-accent" />
                {bullet}
              </li>
            ))}
          </ul>
        </RevealOnScroll>
      )}
      <RevealOnScroll delay={0.4}>
        <Link href={ctaHref}>
          <Button variant="primary" size="lg">
            {ctaLabel}
          </Button>
        </Link>
      </RevealOnScroll>
    </div>
  );

  return (
    <section
      id={id}
      className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh] md:min-h-[85vh]"
    >
      {imageLeft ? (
        <>
          <div className="order-2 md:order-1">{imageBlock}</div>
          <div className="order-1 md:order-2 bg-base md:bg-base-elevated">
            {textBlock}
          </div>
        </>
      ) : (
        <>
          <div className="bg-base-elevated">{textBlock}</div>
          <div>{imageBlock}</div>
        </>
      )}
    </section>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Images } from "lucide-react";

interface VehicleGallerySectionProps {
  images: string[];
  title: string;
}

const MIN_SWIPE_DISTANCE = 50;

export default function VehicleGallerySection({ images, title }: VehicleGallerySectionProps) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0); // 1 = next, -1 = prev
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const lightboxThumbsRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  const total = images.length;
  const current = images[index] ?? images[0];

  useEffect(() => {
    if (!thumbnailsRef.current || total <= 1) return;
    const active = thumbnailsRef.current.querySelector("[data-active]");
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index, total]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const active = lightboxThumbsRef.current?.querySelector("[data-lightbox-active]");
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [lightboxIndex, lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (total + i - 1) % total);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i + 1) % total);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, total]);

  const openLightbox = (atIndex: number) => {
    setSlideDirection(0);
    setLightboxIndex(atIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setIndex(lightboxIndex);
  };

  const lightboxPrev = () => {
    setSlideDirection(-1);
    setLightboxIndex((i) => (total + i - 1) % total);
  };
  const lightboxNext = () => {
    setSlideDirection(1);
    setLightboxIndex((i) => (i + 1) % total);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = () => {
    if (touchStart.current == null || touchEnd.current == null) return;
    const d = touchStart.current - touchEnd.current;
    if (Math.abs(d) < MIN_SWIPE_DISTANCE) return;
    if (d > 0) lightboxNext();
    else lightboxPrev();
  };

  if (!images.length) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#111318] overflow-hidden aspect-video flex items-center justify-center">
        <p className="text-[#9AA4B2]">Aucune image</p>
      </div>
    );
  }

  const prev = () => setIndex((i) => (total + i - 1) % total);
  const next = () => setIndex((i) => (i + 1) % total);
  const lightboxImage = images[lightboxIndex] ?? images[0];

  return (
    <>
      <section className="rounded-2xl border border-white/5 bg-[#111318] overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Main 16:9 area — click opens lightbox */}
          <button
            type="button"
            onClick={() => openLightbox(index)}
            className="relative flex-1 aspect-video lg:aspect-auto lg:min-h-[400px] bg-[#151922] cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-inset overflow-hidden group"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                <motion.div
                  className="absolute inset-0"
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <Image
                    src={current}
                    alt={`${title} - ${index + 1}/${total}`}
                    fill
                    className="object-contain lg:object-cover"
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 70vw"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Overlay pill: "Voir les photos (X)" — bottom-right */}
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openLightbox(index);
              }}
              className="absolute bottom-3 right-3 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/75 text-white text-sm font-medium backdrop-blur-sm border border-white/10 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Images className="w-4 h-4 shrink-0" />
              <span>Voir les photos ({total})</span>
            </motion.button>

            {total > 1 && (
              <>
                <span
                  role="presentation"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                >
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 text-white transition-all"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </span>
                <span
                  role="presentation"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                >
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 border border-white/10 text-white transition-all"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </span>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-medium pointer-events-none">
                  {index + 1} / {total}
                </div>
              </>
            )}
          </button>

          {/* Thumbnails — click switches image and can open lightbox */}
          {total > 1 && (
            <div
              ref={thumbnailsRef}
              className="flex lg:flex-col gap-2 p-3 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto lg:max-h-[400px] scrollbar-hide border-t lg:border-t-0 lg:border-l border-white/5 flex-shrink-0"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    openLightbox(i);
                  }}
                  data-active={i === index ? "true" : undefined}
                  className={`relative flex-shrink-0 w-20 h-14 lg:w-24 lg:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    i === index
                      ? "border-white/80 ring-2 ring-white/30"
                      : "border-white/20 hover:border-white/40 opacity-80 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" unoptimized sizes="96px" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#000] flex flex-col"
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-50 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>

            <div
              className="flex-1 flex items-center justify-center min-h-0 relative"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={lightboxIndex}
                  initial={{ opacity: 0, x: slideDirection === 0 ? 0 : slideDirection * 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: slideDirection === 0 ? 0 : -slideDirection * 80 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center p-4"
                >
                  <Image
                    src={lightboxImage}
                    alt={`${title} - ${lightboxIndex + 1}/${total}`}
                    fill
                    className="object-contain"
                    unoptimized
                    sizes="100vw"
                    onClick={(e) => e.stopPropagation()}
                  />
                </motion.div>
              </AnimatePresence>

              {total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={lightboxPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-10 transition-colors"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    type="button"
                    onClick={lightboxNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-10 transition-colors"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>

            <div className="py-3 px-4 text-center text-white/80 text-sm">
              {lightboxIndex + 1} / {total}
            </div>

            {total > 1 && (
              <div
                ref={lightboxThumbsRef}
                className="overflow-x-auto scrollbar-hide py-3 px-4 flex justify-center gap-2 border-t border-white/10"
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    data-lightbox-active={i === lightboxIndex ? "true" : undefined}
                    className={`relative flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                      i === lightboxIndex ? "border-white" : "border-white/30 hover:border-white/50"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" unoptimized sizes="56px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

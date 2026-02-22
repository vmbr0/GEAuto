"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface VehicleHeroGalleryProps {
  images: string[];
  title: string;
  heroRef?: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}

export default function VehicleHeroGallery({
  images,
  title,
  heroRef: externalHeroRef,
  children,
}: VehicleHeroGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const internalHeroRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const heroRef = externalHeroRef ?? internalHeroRef;

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  const total = images.length;
  const currentImage = images[currentIndex] ?? images[0];

  const goTo = (index: number) => {
    setCurrentIndex((total + index) % total);
  };
  const prev = () => goTo(currentIndex - 1);
  const next = () => goTo(currentIndex + 1);

  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (touchStart == null || touchEnd == null) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) < minSwipeDistance) return;
    if (distance > 0) next();
    else prev();
  };

  useEffect(() => {
    if (!thumbnailsRef.current || total <= 1) return;
    const active = thumbnailsRef.current.querySelector("[data-active]");
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [currentIndex, total]);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen, currentIndex, total]);

  return (
    <>
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        className="relative h-[70vh] min-h-[420px] overflow-hidden"
      >
        {/* Slider layer with parallax */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 w-full h-[120%]"
        >
          <button
            type="button"
            onClick={() => total > 0 && setIsFullscreen(true)}
            className="absolute inset-0 w-full h-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-inset"
            aria-label="Ouvrir la galerie en plein écran"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 w-full h-full group cursor-zoom-in"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <img
                  src={currentImage}
                  alt={`${title} - Image ${currentIndex + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading={currentIndex === 0 ? "eager" : "lazy"}
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </button>
        </motion.div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/40 to-transparent pointer-events-none"
          aria-hidden
        />

        {/* Overlay content (title + price) */}
        <div className="absolute inset-0 flex flex-col pointer-events-none">
          <div className="pointer-events-auto">{children}</div>
        </div>

        {/* Navigation arrows — only if multiple images */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white backdrop-blur-sm z-20 transition-all pointer-events-auto hover:scale-110"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white backdrop-blur-sm z-20 transition-all pointer-events-auto hover:scale-110"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image counter */}
        {total > 1 && (
          <div className="absolute top-4 right-4 md:top-auto md:bottom-20 right-4 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white text-sm font-medium z-20">
            {currentIndex + 1} / {total}
          </div>
        )}

        {/* Thumbnails row */}
        {total > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 pb-4 pt-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
            <div className="pointer-events-auto overflow-x-auto scrollbar-hide px-4 flex justify-center gap-2" ref={thumbnailsRef}>
              {images.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  data-active={index === currentIndex ? "true" : undefined}
                  className={`relative flex-shrink-0 w-16 h-11 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 flex items-center justify-center ${
                    index === currentIndex
                      ? "border-white ring-2 ring-white/40 scale-105"
                      : "border-white/30 hover:border-white/50 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Fullscreen modal gallery */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-50 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex-1 relative flex items-center justify-center min-h-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="relative w-full h-full"
                >
                  <img
                    src={currentImage}
                    alt={`${title} - Image ${currentIndex + 1}`}
                    className="absolute inset-0 w-full h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </motion.div>
              </AnimatePresence>

              {total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>

            <div className="py-4 px-4 text-center text-white/80 text-sm">
              {currentIndex + 1} / {total}
            </div>

            {total > 1 && (
              <div className="overflow-x-auto scrollbar-hide py-3 px-4 flex justify-center gap-2 border-t border-white/10">
                {images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`relative flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex ? "border-white" : "border-white/30 hover:border-white/50"
                    }`}
                  >
                    <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
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

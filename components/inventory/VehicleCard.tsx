"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FuelType, Transmission, VehicleStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
  vehicle: {
    id: string;
    slug: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    mileage: number;
    fuelType: FuelType | string;
    transmission: Transmission | string;
    color?: string | null;
    priceResale?: number | null;
    pricePurchase: number;
    coverImage?: string | null;
    images: string[];
    status: VehicleStatus | string;
    potentialMargin?: number | null;
    cvFiscaux?: number;
    powerHp?: number | null;
  };
  index: number;
}

const statusLabels: Record<VehicleStatus, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Réservé",
  SOLD: "Vendu",
};

export default function VehicleCard({ vehicle, index }: VehicleCardProps) {
  const mainImage =
    vehicle.coverImage || vehicle.images[0] || "/placeholder-vehicle.jpg";
  const price = vehicle.priceResale || vehicle.pricePurchase;

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group"
    >
      <Link href={`/inventory/${vehicle.slug}`} className="block">
        <div
          className={cn(
            "relative rounded-2xl overflow-hidden",
            "border border-white/10 bg-base-card",
            "transition-all duration-500 ease-out",
            "hover:border-white/20 hover:shadow-glow hover:shadow-accent/20"
          )}
        >
          {/* Image – dominant, smooth zoom */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <motion.div
              className="absolute inset-0"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={mainImage}
                alt={vehicle.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized
              />
            </motion.div>

            {/* Gradient fade at bottom – always visible */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(11,15,20,0.95) 0%, rgba(11,15,20,0.4) 35%, transparent 70%)",
              }}
            />

            {/* Status badge – top right */}
            <div className="absolute top-4 right-4">
              <span
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm",
                  vehicle.status === "AVAILABLE" && "bg-emerald-500/90 text-white",
                  vehicle.status === "RESERVED" && "bg-amber-500/90 text-black",
                  vehicle.status === "SOLD" && "bg-zinc-600/90 text-zinc-200"
                )}
              >
                {statusLabels[vehicle.status as VehicleStatus]}
              </span>
            </div>

            {/* Overlay content – title + price at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
              <h3 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight mb-1">
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="text-zinc-300 text-sm mb-4">{vehicle.title}</p>
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <span className="text-2xl md:text-3xl font-bold text-white">
                  {price.toLocaleString("fr-FR")} €
                </span>
                <span className="text-zinc-400 text-sm">
                  {vehicle.year} · {vehicle.mileage.toLocaleString("fr-FR")} km
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

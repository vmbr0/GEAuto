"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { CheckCircle, MessageCircle, Calendar } from "lucide-react";
import { VehicleStatus } from "@prisma/client";

interface StickyCTAProps {
  status: VehicleStatus;
  price: number;
  isAdmin?: boolean;
}

export default function StickyCTA({ status, price, isAdmin = false }: StickyCTAProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAvailable = status === "AVAILABLE";

  return (
    <>
      {/* Desktop Sticky Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`hidden lg:block ${isSticky ? "lg:sticky lg:top-24" : ""} transition-all duration-300`}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
          {/* Price Display */}
          <div className="pb-6 border-b border-gray-100">
            <div className="text-sm text-gray-500 mb-2">Prix de vente</div>
            <div className="text-4xl font-bold text-gray-900">
              {price.toLocaleString()} €
            </div>
          </div>

          {/* CTA Buttons */}
          {isAvailable ? (
            <div className="space-y-3">
              <Button variant="primary" fullWidth size="lg" className="text-lg py-4">
                <Calendar className="w-5 h-5 mr-2" />
                Réserver le véhicule
              </Button>
              <Button variant="outline" fullWidth size="lg" className="text-lg py-4">
                <MessageCircle className="w-5 h-5 mr-2" />
                Demander des informations
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">
                Ce véhicule n&apos;est plus disponible
              </p>
            </div>
          )}

          {/* Financing Message */}
          {isAvailable && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Financement disponible sur demande
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Sticky Bottom Bar */}
      {isAvailable && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 p-4"
        >
          <div className="container-custom flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-gray-500">Prix</div>
              <div className="text-xl font-bold text-gray-900">
                {price.toLocaleString()} €
              </div>
            </div>
            <Button variant="primary" size="lg" className="flex-1">
              Réserver
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
}

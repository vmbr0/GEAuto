"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Euro } from "lucide-react";
import Card from "@/components/ui/Card";

interface ImportCostBreakdownProps {
  purchasePrice: number;
  cvFiscaux: number;
  regionPricePerCV: number;
  cocPrice: number;
  germanPlateCost: number;
  transportCost: number;
  totalImportCost: number;
}

export default function ImportCostBreakdown({
  purchasePrice,
  cvFiscaux,
  regionPricePerCV,
  cocPrice,
  germanPlateCost,
  transportCost,
  totalImportCost,
}: ImportCostBreakdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const carteGrise = cvFiscaux * regionPricePerCV;

  const items = [
    {
      label: "Prix d'achat",
      value: purchasePrice,
      detail: null,
    },
    {
      label: "Carte grise",
      value: carteGrise,
      detail: `${cvFiscaux} CV × ${regionPricePerCV} €`,
    },
    {
      label: "Certificat de conformité (COC)",
      value: cocPrice,
      detail: null,
    },
    {
      label: "Plaque temporaire allemande",
      value: germanPlateCost,
      detail: null,
    },
    {
      label: "Transport",
      value: transportCost,
      detail: null,
    },
  ];

  return (
    <Card>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          <Euro className="w-5 h-5 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-900">
            Détail des coûts d&apos;importation
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {item.label}
                    </div>
                    {item.detail && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.detail}
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {item.value.toLocaleString()} €
                  </div>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-900">
                    Total coût d&apos;importation
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalImportCost.toLocaleString()} €
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

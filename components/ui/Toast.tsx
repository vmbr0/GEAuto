"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  isVisible: boolean;
  onDismiss: () => void;
  duration?: number;
  dark?: boolean;
}

export default function Toast({
  message,
  type = "success",
  isVisible,
  onDismiss,
  duration = 3000,
  dark = false,
}: ToastProps) {
  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [isVisible, duration, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={
            dark
              ? "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-[#111318] border border-[rgba(255,255,255,0.06)]"
              : "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-white border"
          }
          style={
            !dark
              ? {
                  borderColor: type === "success" ? "#22c55e" : "#ef4444",
                }
              : undefined
          }
        >
          {type === "success" ? (
            <CheckCircle
              className={
                dark ? "w-5 h-5 text-emerald-400 flex-shrink-0" : "w-5 h-5 text-green-600 flex-shrink-0"
              }
            />
          ) : (
            <XCircle
              className={
                dark ? "w-5 h-5 text-red-400 flex-shrink-0" : "w-5 h-5 text-red-600 flex-shrink-0"
              }
            />
          )}
          <span
            className={
              dark
                ? type === "success"
                  ? "text-emerald-300"
                  : "text-red-300"
                : type === "success"
                  ? "text-green-800"
                  : "text-red-800"
            }
          >
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

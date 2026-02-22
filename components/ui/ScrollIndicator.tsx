"use client";

import { motion } from "framer-motion";

export default function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="text-xs uppercase tracking-[0.2em] text-zinc-300">
        Défiler
      </span>
      <motion.div
        className="w-6 h-10 rounded-full border border-zinc-400/60 flex justify-center pt-2"
        animate={{ y: [0, 6, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-zinc-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </motion.div>
    </motion.div>
  );
}

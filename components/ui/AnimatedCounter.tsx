"use client";

import { useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { motion } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  /** Trigger animation when in view */
  triggerOnView?: boolean;
}

export default function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 2,
  className = "",
  triggerOnView = true,
}: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!triggerOnView || isInView) {
      let start: number;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / (duration * 1000), 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOut * value));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, [value, duration, isInView, triggerOnView]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

interface StatBlockProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  delay?: number;
}

export function StatBlock({
  value,
  suffix = "",
  prefix = "",
  label,
  delay = 0,
}: StatBlockProps) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white tracking-tight">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </div>
      <p className="mt-3 text-zinc-300 text-sm md:text-base uppercase tracking-widest">
        {label}
      </p>
    </motion.div>
  );
}

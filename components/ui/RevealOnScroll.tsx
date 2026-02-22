"use client";

import { ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right";

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  /** Animation delay in seconds */
  delay?: number;
  /** Direction of slide-in */
  direction?: Direction;
  /** Distance of slide (px) */
  distance?: number;
  /** Only animate when in view (default true) */
  once?: boolean;
  /** Viewport margin for trigger (default "-80px") */
  margin?: string;
  /** Stagger children - use with RevealOnScroll as parent of multiple items */
  stagger?: number;
  /** Duration in seconds */
  duration?: number;
}

export default function RevealOnScroll({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 40,
  once = true,
  margin = "-80px",
  duration = 0.7,
}: RevealOnScrollProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: margin as `${number}px` });
  const x0 = direction === "left" ? distance : direction === "right" ? -distance : 0;
  const y0 = direction === "up" ? distance : direction === "down" ? -distance : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: x0, y: y0 }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: x0, y: y0 }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container - use with staggerChildren on parent */
export function RevealStagger({
  children,
  className,
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Single item for use inside RevealStagger */
export function RevealStaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

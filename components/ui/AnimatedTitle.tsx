"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTitleProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
  /** Stagger character animation (for short headlines) */
  animateLetters?: boolean;
  /** Delay before animation starts */
  delay?: number;
  /** Wide letter spacing (uppercase style) */
  wide?: boolean;
  /** Accent color for part of title - wrap in <span className="text-accent"> */
  accent?: boolean;
}

export default function AnimatedTitle({
  children,
  as = "h1",
  className,
  animateLetters = false,
  delay = 0,
  wide = false,
}: AnimatedTitleProps) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={cn(
        "font-display font-bold tracking-tight",
        as === "h1" && "text-5xl md:text-6xl lg:text-7xl xl:text-8xl",
        as === "h2" && "text-4xl md:text-5xl lg:text-6xl",
        as === "h3" && "text-3xl md:text-4xl",
        as === "h4" && "text-2xl md:text-3xl",
        wide && "tracking-[0.08em] uppercase",
        className
      )}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}

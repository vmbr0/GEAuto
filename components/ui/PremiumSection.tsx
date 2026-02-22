"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PremiumSectionProps {
  children: ReactNode;
  className?: string;
  /** Full viewport height (hero style) */
  fullHeight?: boolean;
  /** Dark gradient overlay behind content */
  darkOverlay?: boolean;
  /** Subtle noise texture overlay */
  noise?: boolean;
  /** Background: "dark" | "darker" | "gradient" | "none" */
  variant?: "dark" | "darker" | "gradient" | "none";
  /** Optional background image URL */
  backgroundImage?: string;
  /** Content max width - default container-custom */
  containerClassName?: string;
}

export default function PremiumSection({
  children,
  className,
  fullHeight = false,
  darkOverlay = false,
  noise = false,
  variant = "dark",
  backgroundImage,
  containerClassName = "container-custom",
}: PremiumSectionProps) {
  const bgStyles = {
    dark: "bg-base",
    darker: "bg-black",
    gradient:
      "bg-gradient-to-b from-base via-base-elevated to-base",
    none: "",
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        fullHeight && "min-h-screen flex flex-col justify-center",
        !fullHeight && "section-spacing",
        bgStyles[variant],
        className
      )}
    >
      {/* Background image layer */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Dark overlay gradient */}
      {darkOverlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 50%, rgba(10,10,12,0.98) 100%)",
          }}
        />
      )}

      {/* Noise texture */}
      {noise && <div className="absolute inset-0 bg-noise pointer-events-none" />}

      <div className={cn("relative z-10", containerClassName)}>{children}</div>
    </section>
  );
}

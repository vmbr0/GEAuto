/**
 * Theme Configuration
 * Centralized design system values
 */

export const theme = {
  colors: {
    black: "#111111",
    white: "#FFFFFF",
    navy: "#0F1C2E",
    gray: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
  },
  spacing: {
    xs: "0.5rem",   // 8px
    sm: "1rem",     // 16px
    md: "1.5rem",   // 24px
    lg: "2rem",     // 32px
    xl: "3rem",     // 48px
    "2xl": "4rem",  // 64px
    "3xl": "6rem",  // 96px
    "4xl": "8rem",  // 128px
  },
  typography: {
    fontFamily: {
      sans: 'var(--font-geometric), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],      // 12px
      sm: ["0.875rem", { lineHeight: "1.25rem" }],  // 14px
      base: ["1rem", { lineHeight: "1.5rem" }],     // 16px
      lg: ["1.125rem", { lineHeight: "1.75rem" }],  // 18px
      xl: ["1.25rem", { lineHeight: "1.75rem" }],   // 20px
      "2xl": ["1.5rem", { lineHeight: "2rem" }],    // 24px
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
      "5xl": ["3rem", { lineHeight: "1" }],         // 48px
      "6xl": ["3.75rem", { lineHeight: "1" }],      // 60px
      "7xl": ["4.5rem", { lineHeight: "1" }],       // 72px
      "8xl": ["6rem", { lineHeight: "1" }],         // 96px
      "9xl": ["8rem", { lineHeight: "1" }],         // 128px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  borderRadius: {
    sm: "0.25rem",   // 4px
    md: "0.5rem",    // 8px
    lg: "0.75rem",   // 12px
    xl: "1rem",      // 16px
    "2xl": "1.5rem", // 24px
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  transitions: {
    default: "all 0.2s ease",
    fast: "all 0.15s ease",
    slow: "all 0.3s ease",
  },
} as const;

export type Theme = typeof theme;

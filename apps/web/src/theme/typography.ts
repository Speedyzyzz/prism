/** Prism OS — Typography Tokens */
export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
  },
  fontSize: {
    xs: "0.75rem",      // 12px
    sm: "0.8125rem",    // 13px
    base: "0.9375rem",  // 15px
    lg: "1.0625rem",    // 17px
    xl: "1.25rem",      // 20px
    "2xl": "1.5rem",    // 24px
    "3xl": "1.875rem",  // 30px
    "4xl": "2.25rem",   // 36px
    "5xl": "3rem",      // 48px
    "6xl": "3.75rem",   // 60px
    "7xl": "4.5rem",    // 72px
    hero: "5.5rem",     // 88px
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    black: "900",
  },
  lineHeight: {
    tight: "1.05",
    snug: "1.2",
    normal: "1.5",
    relaxed: "1.65",
  },
  letterSpacing: {
    tighter: "-0.04em",
    tight: "-0.02em",
    normal: "0",
    wide: "0.02em",
    wider: "0.1em",
    widest: "0.2em",
  },
} as const;

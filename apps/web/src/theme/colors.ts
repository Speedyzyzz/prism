/** OmniShop OS — Color Tokens */
export const colors = {
  bg: {
    primary: "#fafafa",
    surface: "#ffffff",
    surfaceHover: "#f4f4f5",
    surfaceActive: "#e4e4e7",
    overlay: "rgba(0, 0, 0, 0.4)",
  },
  text: {
    primary: "#18181b",     // zinc-900
    secondary: "#71717a",   // zinc-500
    tertiary: "#a1a1aa",    // zinc-400
    inverse: "#ffffff",
    muted: "#d4d4d8",       // zinc-300
  },
  border: {
    default: "#e4e4e7",     // zinc-200
    subtle: "#f4f4f5",      // zinc-100
    strong: "#d4d4d8",      // zinc-300
  },
  accent: {
    primary: "#f97316",     // orange-500
    primaryHover: "#ea580c", // orange-600
    glow: "rgba(249, 115, 22, 0.15)",
  },
  semantic: {
    success: "#22c55e",
    successGlow: "rgba(34, 197, 94, 0.15)",
    warning: "#f59e0b",
    warningGlow: "rgba(245, 158, 11, 0.15)",
    error: "#ef4444",
    errorGlow: "rgba(239, 68, 68, 0.15)",
    info: "#3b82f6",
  },
  glass: {
    bg: "rgba(255, 255, 255, 0.7)",
    bgStrong: "rgba(255, 255, 255, 0.85)",
    border: "rgba(228, 228, 231, 0.5)",
  },
} as const;

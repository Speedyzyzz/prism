/** OmniShop OS — Animation Tokens */
export const animations = {
  ease: {
    apple: [0.32, 0.72, 0, 1] as const,
    spring: { type: "spring", stiffness: 300, damping: 30 } as const,
    bounce: { type: "spring", stiffness: 400, damping: 17 } as const,
  },
  duration: {
    micro: 0.15,     // hover states, toggles
    fast: 0.3,       // button presses, small transitions
    standard: 0.6,   // page transitions, card animations
    slow: 1.0,       // hero animations
    hero: 1.2,       // landing page reveals
  },
  stagger: {
    fast: 0.04,
    standard: 0.08,
    slow: 0.15,
  },
} as const;

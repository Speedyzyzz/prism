/** Prism OS — Shared Framer Motion Variants */
import type { Variants, Transition } from "framer-motion";

// Apple easing curve used everywhere
const appleEase = [0.32, 0.72, 0, 1] as const;

/** Fade up from below — standard page/card entrance */
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeUpTransition: Transition = {
  duration: 0.6,
  ease: appleEase,
};

/** Scale in from slightly smaller — modals, panels */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

/** Slide in from right — context panel morph */
export const slideRight: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

/** Stagger container — wrap children that each use fadeUp */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

/** Fast stagger for dense lists */
export const fastStaggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

/** Context panel layout morph transition */
export const contextPanelTransition: Transition = {
  duration: 0.5,
  ease: appleEase,
};

/** Standard transition used across the app */
export const standardTransition: Transition = {
  duration: 0.6,
  ease: appleEase,
};

export const sidebarTransition: Transition = {
  duration: 0.4,
  ease: appleEase,
};

/** Fast transition for micro interactions */
export const fastTransition: Transition = {
  duration: 0.3,
  ease: appleEase,
};

/** Message bubble entrance */
export const messageBubble: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

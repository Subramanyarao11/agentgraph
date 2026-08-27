import type { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * The app's one motion language, in one place, so every page feels the same
 * instead of each component inventing its own duration/easing. Kept
 * deliberately restrained: short durations, small offsets, no bounce —
 * motion that reads as "responsive UI," not "look at this animation."
 */
const EASE = [0.16, 1, 0.3, 1] as const; // easeOutExpo-ish — quick start, gentle settle
const DURATION = 0.22;

type Tag = "div" | "section" | "tbody" | "tr";

/** Fades + lifts content in on mount. Use for page sections, cards, panels. */
export function FadeIn({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: Tag;
}) {
  const Component = motion[as];
  return (
    <Component
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION, delay, ease: EASE }}
      className={className}
    >
      {children}
    </Component>
  );
}

/** Parent for a staggered list — pair with <StaggerItem> children. */
export function StaggerGroup({
  children,
  className,
  staggerDelay = 0.035,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  as?: Tag;
}) {
  const Component = motion[as];
  return (
    <Component
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: staggerDelay } } }}
      className={className}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: Tag;
}) {
  const Component = motion[as];
  return (
    <Component
      variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: DURATION, ease: EASE }}
      className={className}
    >
      {children}
    </Component>
  );
}

/** Shared tap/hover feel for buttons and clickable rows — call spread on a motion element. */
export const tapScale = {
  whileTap: { scale: 0.97 },
  transition: { duration: 0.12 },
};

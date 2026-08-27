import { motion } from "framer-motion";

/**
 * Shown while a route's lazy chunk (see the .lazy.tsx split) is fetching.
 * A thin top-of-viewport bar rather than a full-page spinner — the shell
 * (sidebar, header) stays put, only the content area is "loading."
 */
export function RoutePending() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-transparent">
      <motion.div
        className="h-full w-1/3 bg-primary"
        initial={{ x: "-100%" }}
        animate={{ x: "300%" }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

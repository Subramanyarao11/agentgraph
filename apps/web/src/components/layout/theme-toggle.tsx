import { AnimatePresence, m } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle theme"
      className="overflow-hidden text-muted-foreground"
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={theme ?? "unknown"}
          initial={{ opacity: 0, scale: 0.8, filter: "blur(3px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.8, filter: "blur(3px)" }}
          transition={{ duration: 0.15 }}
          className="flex h-4 w-4 items-center justify-center"
        >
          {theme === null ? <span className="h-4 w-4" /> : theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </m.span>
      </AnimatePresence>
    </Button>
  );
}

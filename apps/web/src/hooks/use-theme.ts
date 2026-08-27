import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Tracks the resolved theme and lets the toggle flip it. Starts `null`
 * (unknown) on the server and the first client render so it never disagrees
 * with SSR output — the inline script in __root.tsx already set the DOM
 * attribute before paint, this hook just reads it back into React state.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setThemeState(current === "light" || current === "dark" ? current : systemPrefersDark() ? "dark" : "light");
  }, []);

  function setTheme(next: Theme) {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage unavailable (private mode, etc.) — theme just won't persist.
    }
    setThemeState(next);
  }

  return { theme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}

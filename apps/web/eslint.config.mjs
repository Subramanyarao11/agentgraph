import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist/**", ".output/**", "node_modules/**", "src/routeTree.gen.ts"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Downgraded from the plugin's default "error": this rule can't distinguish a
      // setState-in-effect that's genuinely synchronizing with an external system (the
      // canonical correct use of useEffect) from one deriving state that belongs in render.
      // Two real cases here are the former — use-theme.ts reads the DOM's pre-hydration
      // theme attribute on mount (must stay in an effect: computing it eagerly during SSR
      // would either crash on a missing `document` or produce a hydration mismatch), and
      // explore.lazy.tsx merges incoming query results into an accumulator across multiple
      // fetches over time, not a value derivable from current props alone. Left at "warn"
      // instead of disabling outright so real regressions still surface in `pnpm lint`.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
);

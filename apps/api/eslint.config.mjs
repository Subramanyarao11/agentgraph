import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Nest decorators (@Controller, @Injectable, ...) are legitimately
      // untyped at the call site — this rule fights the framework, not bugs.
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },
);

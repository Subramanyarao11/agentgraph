import { fileURLToPath } from "node:url";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: { port: 3000 },
  resolve: {
    alias: {
      // @agentgraph/graph-schema ships CJS (for NestJS/Node consumers).
      // Vite's dev-server SSR module runner evaluates linked workspace
      // packages as raw ESM without CJS interop, which breaks on a plain
      // `exports.x = ...` file. The web app only needs types + Zod schema
      // objects from this package, so point straight at its TS source —
      // Vite compiles that natively, sidestepping the CJS dist entirely.
      "@agentgraph/graph-schema": fileURLToPath(
        new URL("../../packages/graph-schema/src/index.ts", import.meta.url),
      ),
    },
  },
  plugins: [tsconfigPaths(), tailwindcss(), tanstackStart(), nitro(), viteReact()],
});

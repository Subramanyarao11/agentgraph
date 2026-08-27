import type { ReactNode } from "react";
import { useState } from "react";
import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { createQueryClient } from "@/lib/query-client";
import { RouteErrorBoundary } from "@/components/route-error-boundary";
import { RouteNotFound } from "@/components/route-not-found";
import { RoutePending } from "@/components/route-pending";
import appCss from "@/styles/app.css?url";

export const Route = createRootRoute({
  errorComponent: RouteErrorBoundary,
  notFoundComponent: RouteNotFound,
  pendingComponent: RoutePending,
  pendingMs: 150,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AgentGraph — Agentic Workflow Impact & Lineage" },
      {
        name: "description",
        content: "Explore agent, tool, workflow, and data dependencies as a graph — powered by CognoDB.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const [queryClient] = useState(createQueryClient);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before paint so there's no flash of the wrong theme on load —
            React never sees this attribute, hence suppressHydrationWarning above. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`,
          }}
        />
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {/* domAnimation is the smaller (~15KB vs ~35KB) framer-motion feature bundle —
              covers every animation this app uses (opacity/transform, exit animations),
              just not drag or layout-projection. `strict` throws if any component still
              imports the full `motion` API instead of `m`, so this can't silently regress.
              Honors the OS "reduce motion" setting: transforms fall back to opacity-only. */}
          <LazyMotion features={domAnimation} strict>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
          </LazyMotion>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}

import type { ComponentProps } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  Activity,
  Bookmark,
  Bot,
  Database,
  GitCommitHorizontal,
  LayoutDashboard,
  Network,
  PlayCircle,
  Radar,
  Search,
  ShieldAlert,
  Sparkles,
  Trophy,
  Users,
  Workflow as WorkflowIcon,
  Wrench,
  Waypoints,
} from "lucide-react";
import { CommandPalette, openCommandPalette } from "@/components/command-palette";
import { catalogListQueryOptions } from "@/hooks/use-catalog";
import { exposureQueryOptions } from "@/hooks/use-analysis";
import { savedViewsQueryOptions } from "@/hooks/use-views";
import { observabilityLogQueryOptions, observabilitySummaryQueryOptions } from "@/hooks/use-observability";
import type { NodeLabel } from "@agentgraph/graph-schema";
import { cn } from "@/lib/utils";

type LinkProps = ComponentProps<typeof Link>;

interface NavItem {
  to: LinkProps["to"];
  // Left loose: LinkProps["params"] is a reducer type keyed to a single
  // literal `to`, which doesn't fit a heterogeneous nav config array. Cast
  // at the call site instead of threading `any` through this data.
  params?: Record<string, string>;
  label: string;
  icon: typeof LayoutDashboard;
  /**
   * `defaultPreload: "intent"` (router.tsx) already prefetches a route's JS
   * chunk on hover/focus — this prefetches the *data* it'll immediately
   * fetch on mount too, using the exact same query key each page computes,
   * so the click lands on a warm cache instead of a fresh loading spinner.
   */
  prefetch?: (queryClient: QueryClient) => void;
}

const CATALOG_PAGE = { limit: 25, offset: 0 };

function prefetchCatalog(label: NodeLabel) {
  return (queryClient: QueryClient) => queryClient.prefetchQuery(catalogListQueryOptions(label, CATALOG_PAGE));
}

const NAV_SECTIONS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Overview",
    items: [
      {
        to: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        prefetch: (qc) => {
          (["Agent", "Tool", "Workflow", "Dataset"] as const).forEach((label) =>
            qc.prefetchQuery(catalogListQueryOptions(label, { limit: 1 })),
          );
          qc.prefetchQuery(catalogListQueryOptions("Execution", { limit: 8 }));
          qc.prefetchQuery(exposureQueryOptions("pii"));
        },
      },
      { to: "/explore", label: "Graph Explorer", icon: Network },
    ],
  },
  {
    label: "Catalog",
    items: [
      { to: "/catalog/$label", params: { label: "Agent" }, label: "Agents", icon: Bot, prefetch: prefetchCatalog("Agent") },
      { to: "/catalog/$label", params: { label: "Tool" }, label: "Tools", icon: Wrench, prefetch: prefetchCatalog("Tool") },
      {
        to: "/catalog/$label",
        params: { label: "Workflow" },
        label: "Workflows",
        icon: WorkflowIcon,
        prefetch: prefetchCatalog("Workflow"),
      },
      {
        to: "/catalog/$label",
        params: { label: "Dataset" },
        label: "Datasets",
        icon: Database,
        prefetch: prefetchCatalog("Dataset"),
      },
      { to: "/catalog/$label", params: { label: "Person" }, label: "People", icon: Users, prefetch: prefetchCatalog("Person") },
    ],
  },
  {
    label: "Analysis",
    items: [
      { to: "/analysis/impact", label: "Impact Analysis", icon: Radar },
      { to: "/analysis/lineage", label: "Data Lineage", icon: GitCommitHorizontal },
      { to: "/analysis/exposure", label: "Sensitive-Data Exposure", icon: ShieldAlert },
      { to: "/analysis/similar-agents", label: "Similar Agents", icon: Sparkles },
      { to: "/analysis/leaderboard", label: "Similarity Leaderboard", icon: Trophy },
    ],
  },
  {
    label: "Activity",
    items: [
      {
        to: "/executions",
        label: "Executions",
        icon: PlayCircle,
        prefetch: prefetchCatalog("Execution"),
      },
      { to: "/views", label: "Saved Views", icon: Bookmark, prefetch: (qc) => qc.prefetchQuery(savedViewsQueryOptions) },
    ],
  },
  {
    label: "System",
    items: [
      {
        to: "/observability",
        label: "Observability",
        icon: Activity,
        prefetch: (qc) => {
          qc.prefetchQuery(observabilitySummaryQueryOptions);
          qc.prefetchQuery(observabilityLogQueryOptions);
        },
      },
    ],
  },
];

export function Sidebar() {
  const queryClient = useQueryClient();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/50 md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Waypoints className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight">AgentGraph</span>
      </div>
      <div className="px-3 pt-3">
        <button
          type="button"
          onClick={openCommandPalette}
          className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <Search className="h-3.5 w-3.5" />
          Search…
          <kbd className="ml-auto rounded border border-border px-1 text-[10px]">⌘K</kbd>
        </button>
      </div>
      <CommandPalette />
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  params={item.params as LinkProps["params"]}
                  activeOptions={{ exact: item.to === "/" }}
                  onMouseEnter={() => item.prefetch?.(queryClient)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md border-l-2 border-transparent py-1.5 pl-2 pr-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  )}
                  activeProps={{ className: "!border-primary !bg-accent !text-accent-foreground font-medium" }}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-4 text-[11px] leading-relaxed text-tertiary-foreground">
        Backed by CognoDB — a managed graph database speaking Bolt + openCypher.
      </div>
    </aside>
  );
}

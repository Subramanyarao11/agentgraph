import type { ComponentProps } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  Bot,
  Database,
  GitCommitHorizontal,
  LayoutDashboard,
  PlayCircle,
  Radar,
  ShieldAlert,
  Sparkles,
  Trophy,
  Users,
  Workflow as WorkflowIcon,
  Wrench,
  Waypoints,
} from "lucide-react";
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
}

const NAV_SECTIONS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [
      { to: "/catalog/$label", params: { label: "Agent" }, label: "Agents", icon: Bot },
      { to: "/catalog/$label", params: { label: "Tool" }, label: "Tools", icon: Wrench },
      { to: "/catalog/$label", params: { label: "Workflow" }, label: "Workflows", icon: WorkflowIcon },
      { to: "/catalog/$label", params: { label: "Dataset" }, label: "Datasets", icon: Database },
      { to: "/catalog/$label", params: { label: "Person" }, label: "People", icon: Users },
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
      { to: "/executions", label: "Executions", icon: PlayCircle },
      { to: "/views", label: "Saved Views", icon: Bookmark },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/50 md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Waypoints className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight">AgentGraph</span>
      </div>
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
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  )}
                  activeProps={{ className: "!bg-accent !text-accent-foreground font-medium" }}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-4 text-[11px] leading-relaxed text-muted-foreground">
        Backed by CognoDB — a managed graph database speaking Bolt + openCypher.
      </div>
    </aside>
  );
}

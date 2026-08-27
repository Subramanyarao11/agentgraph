import { Bot, Database, GitBranch, PlayCircle, User, Workflow as WorkflowIcon, Wrench } from "lucide-react";
import type { DataSensitivity, NodeLabel } from "@agentgraph/graph-schema";

export const NODE_DISPLAY: Record<
  NodeLabel,
  { icon: typeof User; color: string; dot: string; fill: string; plural: string }
> = {
  Person: { icon: User, color: "text-slate-500", dot: "bg-slate-400", fill: "fill-slate-400", plural: "People" },
  Agent: { icon: Bot, color: "text-primary", dot: "bg-primary", fill: "fill-primary", plural: "Agents" },
  Tool: {
    icon: Wrench,
    color: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    fill: "fill-amber-500",
    plural: "Tools",
  },
  Workflow: {
    icon: WorkflowIcon,
    color: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    fill: "fill-emerald-500",
    plural: "Workflows",
  },
  Step: {
    icon: GitBranch,
    color: "text-cyan-600 dark:text-cyan-400",
    dot: "bg-cyan-500",
    fill: "fill-cyan-500",
    plural: "Steps",
  },
  Dataset: {
    icon: Database,
    color: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
    fill: "fill-rose-500",
    plural: "Datasets",
  },
  Execution: {
    icon: PlayCircle,
    color: "text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
    fill: "fill-violet-500",
    plural: "Executions",
  },
};

export const SENSITIVITY_VARIANT: Record<DataSensitivity, "outline" | "warning" | "destructive" | "secondary"> = {
  public: "outline",
  internal: "secondary",
  confidential: "warning",
  pii: "destructive",
};

export function nodeName(properties: Record<string, unknown>): string {
  return (properties.name as string | undefined) ?? (properties.id as string | undefined) ?? "Unknown";
}

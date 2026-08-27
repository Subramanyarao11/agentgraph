import type { NodeLabel } from "@agentgraph/graph-schema";
import { NODE_DISPLAY } from "@/lib/node-display";
import { cn } from "@/lib/utils";

export function GraphLegend({ labels }: { labels: NodeLabel[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {labels.map((label) => (
        <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("h-2 w-2 rounded-full", NODE_DISPLAY[label].dot)} />
          {label}
        </div>
      ))}
    </div>
  );
}

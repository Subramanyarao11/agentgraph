import { useEffect, useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Loader2, RotateCcw, Waypoints } from "lucide-react";
import type { GraphEdgeDto, GraphNodeDto, NodeLabel } from "@agentgraph/graph-schema";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { NodePicker } from "@/components/node-picker";
import { GraphCanvas } from "@/components/graph/graph-canvas";
import { GraphLegend } from "@/components/graph/graph-legend";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { FadeIn } from "@/components/motion";
import { useCatalogDetail } from "@/hooks/use-catalog";
import { NODE_DISPLAY } from "@/lib/node-display";

export const Route = createLazyFileRoute("/explore")({
  component: ExplorePage,
});

const START_LABELS: NodeLabel[] = ["Agent", "Tool", "Workflow", "Dataset", "Person"];

/**
 * Click-to-expand graph exploration: pick any node, its 1-hop neighborhood
 * loads (reusing the same GET /catalog/:label/:id the catalog detail page
 * already calls), then clicking any node in that neighborhood fetches *its*
 * neighbors and merges them in — no dedicated "give me the whole graph"
 * endpoint, the graph just grows outward from wherever you click.
 */
function ExplorePage() {
  const [startLabel, setStartLabel] = useState<NodeLabel>("Agent");
  const [focusNode, setFocusNode] = useState<GraphNodeDto | null>(null);
  const [nodes, setNodes] = useState<Map<string, GraphNodeDto>>(new Map());
  const [edges, setEdges] = useState<Map<string, GraphEdgeDto>>(new Map());

  const query = useCatalogDetail(focusNode?.label ?? "Agent", focusNode ? String(focusNode.properties.id) : undefined);

  useEffect(() => {
    if (!query.data) return;
    setNodes((prev) => {
      const next = new Map(prev);
      for (const n of query.data!.nodes) next.set(n.id, n);
      return next;
    });
    setEdges((prev) => {
      const next = new Map(prev);
      for (const e of query.data!.edges) next.set(e.id, e);
      return next;
    });
  }, [query.data]);

  function reset() {
    setNodes(new Map());
    setEdges(new Map());
    setFocusNode(null);
  }

  const nodeList = [...nodes.values()];
  const edgeList = [...edges.values()];
  const presentLabels = [...new Set(nodeList.map((n) => n.label))];

  return (
    <AppShell
      title="Graph Explorer"
      description="Pick a starting node, then click any node in the graph to pull in its connections."
    >
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-4 pt-5">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Start from</p>
            <Tabs value={startLabel} onValueChange={(v) => setStartLabel(v as NodeLabel)}>
              <TabsList aria-label="Starting node label">
                {START_LABELS.map((label) => (
                  <TabsTrigger key={label} value={label}>
                    {NODE_DISPLAY[label].plural}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="min-w-64">
            <label htmlFor="explore-picker" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Node
            </label>
            <NodePicker
              id="explore-picker"
              label={startLabel}
              value={focusNode?.label === startLabel ? focusNode : null}
              onSelect={setFocusNode}
            />
          </div>
          {nodeList.length > 0 && (
            <div className="ml-auto flex items-center gap-3">
              <p className="text-xs text-tertiary-foreground" aria-live="polite">
                {nodeList.length} node{nodeList.length === 1 ? "" : "s"} · {edgeList.length} edge{edgeList.length === 1 ? "" : "s"}
              </p>
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : nodeList.length === 0 ? (
        <EmptyState
          icon={Waypoints}
          title="Pick a node to start exploring"
          description="Search above and select a node — its direct connections load, and clicking any of them pulls in one more hop."
        />
      ) : (
        <FadeIn>
          <Card>
            <CardContent className="pt-5">
              <div className="h-[640px] w-full">
                <GraphCanvas nodes={nodeList} edges={edgeList} highlightId={focusNode?.id} onNodeClick={setFocusNode} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <GraphLegend labels={presentLabels} />
                {query.isFetching && (
                  <span className="flex items-center gap-1.5 text-xs text-tertiary-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    Expanding…
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </AppShell>
  );
}

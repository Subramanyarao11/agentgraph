import { useState } from "react";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { Radar } from "lucide-react";
import { CYPHER_EXPLAINERS, impactListQuery, type GraphNodeDto, type NodeLabel } from "@agentgraph/graph-schema";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { NodePicker } from "@/components/node-picker";
import { GraphCanvas } from "@/components/graph/graph-canvas";
import { GraphLegend } from "@/components/graph/graph-legend";
import { CypherPanel } from "@/components/cypher-panel";
import { SaveViewButton } from "@/components/save-view-button";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";
import { useImpact } from "@/hooks/use-analysis";
import { NODE_DISPLAY, nodeName } from "@/lib/node-display";

export const Route = createLazyFileRoute("/analysis/impact")({
  component: ImpactPage,
});

const SOURCE_LABELS: NodeLabel[] = ["Tool", "Workflow"];

function ImpactPage() {
  const [sourceLabel, setSourceLabel] = useState<NodeLabel>("Tool");
  const [selected, setSelected] = useState<GraphNodeDto | null>(null);
  const [maxHops, setMaxHops] = useState(4);

  const nodeId = selected?.properties.id as string | undefined;
  const query = useImpact(nodeId, maxHops);

  return (
    <AppShell
      title="Impact Analysis"
      description="If this breaks, what — and who — is affected, N hops away?"
      actions={
        selected && (
          <SaveViewButton type="impact" params={{ nodeId, maxHops }} defaultName={`Impact: ${nodeName(selected.properties)}`} />
        )
      }
    >
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-4 pt-5">
          <div className="space-y-1.5">
            <span id="failing-component-type-label" className="text-xs font-medium text-muted-foreground">
              Failing component type
            </span>
            <Tabs
              value={sourceLabel}
              onValueChange={(v) => {
                setSourceLabel(v as NodeLabel);
                setSelected(null);
              }}
            >
              <TabsList aria-labelledby="failing-component-type-label">
                {SOURCE_LABELS.map((l) => (
                  <TabsTrigger key={l} value={l}>
                    {l}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="w-64 space-y-1.5">
            <label htmlFor="impact-node-picker" className="text-xs font-medium text-muted-foreground">
              {sourceLabel}
            </label>
            <NodePicker id="impact-node-picker" label={sourceLabel} value={selected} onSelect={setSelected} />
          </div>

          <div className="w-48 space-y-1.5">
            <label htmlFor="impact-max-hops" className="text-xs font-medium text-muted-foreground">
              Max hops: {maxHops}
            </label>
            <input
              id="impact-max-hops"
              type="range"
              min={1}
              max={6}
              value={maxHops}
              onChange={(e) => setMaxHops(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </CardContent>
      </Card>

      {!selected ? (
        <EmptyState
          icon={Radar}
          title="Pick a tool or workflow"
          description="Choose a component above to see everything within its blast radius."
        />
      ) : query.isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <div className="space-y-4">
          <CypherPanel
            explainer={CYPHER_EXPLAINERS.impact}
            cypher={impactListQuery(maxHops)}
            params={{ nodeId, maxHops }}
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <FadeIn className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Affected ({query.data?.affected.length ?? 0})</CardTitle>
                  <CardDescription>Ranked by shortest hop distance from {nodeName(selected.properties)}.</CardDescription>
                </CardHeader>
                <CardContent>
                  {query.data?.affected.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nothing reaches this within {maxHops} hops. Good isolation.</p>
                  ) : (
                    <StaggerGroup className="space-y-2" staggerDelay={0.02}>
                      {query.data?.affected.map((a) => {
                        const display = NODE_DISPLAY[a.node.label];
                        return (
                          <StaggerItem key={a.node.id} className="flex items-center justify-between text-sm">
                            <Link
                              to="/catalog/$label/$id"
                              params={{ label: a.node.label, id: String(a.node.properties.id) }}
                              className="flex items-center gap-2 hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                            >
                              <display.icon className={`h-3.5 w-3.5 ${display.color}`} />
                              {nodeName(a.node.properties)}
                            </Link>
                            <Badge variant="outline">{a.hops} hop{a.hops === 1 ? "" : "s"}</Badge>
                          </StaggerItem>
                        );
                      })}
                    </StaggerGroup>
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.05} className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Blast radius</CardTitle>
                  <CardDescription>Shortest paths from the failing component to everything affected.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[380px] w-full">
                    <GraphCanvas nodes={query.data?.graph.nodes ?? []} edges={query.data?.graph.edges ?? []} highlightId={query.data?.graph.nodes[0]?.id} />
                  </div>
                  <div className="mt-3">
                    <GraphLegend labels={["Agent", "Workflow", "Tool"]} />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      )}
    </AppShell>
  );
}

import { useState } from "react";
import { createLazyFileRoute } from "@tanstack/react-router";
import { GitCommitHorizontal } from "lucide-react";
import { CYPHER_EXPLAINERS, LINEAGE_PATH_QUERY, type GraphNodeDto } from "@agentgraph/graph-schema";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { NodePicker } from "@/components/node-picker";
import { GraphCanvas } from "@/components/graph/graph-canvas";
import { GraphLegend } from "@/components/graph/graph-legend";
import { CypherPanel } from "@/components/cypher-panel";
import { SaveViewButton } from "@/components/save-view-button";
import { FadeIn } from "@/components/motion";
import { useLineage } from "@/hooks/use-analysis";
import { nodeName } from "@/lib/node-display";

export const Route = createLazyFileRoute("/analysis/lineage")({
  component: LineagePage,
});

function LineagePage() {
  const [selected, setSelected] = useState<GraphNodeDto | null>(null);
  const datasetId = selected?.properties.id as string | undefined;
  const query = useLineage(datasetId);

  return (
    <AppShell
      title="Data Lineage"
      description="Trace a dataset back through every tool, step, workflow, and agent that can produce or consume it."
      actions={selected && <SaveViewButton type="lineage" params={{ datasetId }} defaultName={`Lineage: ${nodeName(selected.properties)}`} />}
    >
      <Card className="mb-4">
        <CardContent className="pt-5">
          <div className="w-72 space-y-1.5">
            <label htmlFor="lineage-node-picker" className="text-xs font-medium text-muted-foreground">
              Dataset
            </label>
            <NodePicker id="lineage-node-picker" label="Dataset" value={selected} onSelect={setSelected} />
          </div>
        </CardContent>
      </Card>

      {!selected ? (
        <EmptyState icon={GitCommitHorizontal} title="Pick a dataset" description="Choose a dataset above to trace its full lineage." />
      ) : query.isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data && query.data.nodes.length <= 1 ? (
        <EmptyState icon={GitCommitHorizontal} title="No lineage found" description="No tool/step/workflow/agent chain reaches this dataset yet." />
      ) : (
        <FadeIn className="space-y-4">
          <CypherPanel explainer={CYPHER_EXPLAINERS.lineage} cypher={LINEAGE_PATH_QUERY} params={{ datasetId }} />
          <Card>
            <CardHeader>
              <CardTitle>Dataset → Tool → Step → Workflow → Agent</CardTitle>
              <CardDescription>Every 4-hop chain that can produce or consume {nodeName(selected.properties)}.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[440px] w-full">
                <GraphCanvas nodes={query.data?.nodes ?? []} edges={query.data?.edges ?? []} highlightId={query.data?.nodes.find((n) => n.properties.id === datasetId)?.id} />
              </div>
              <div className="mt-3">
                <GraphLegend labels={["Agent", "Workflow", "Step", "Tool", "Dataset"]} />
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </AppShell>
  );
}

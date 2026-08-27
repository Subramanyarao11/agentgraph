import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GitCommitHorizontal } from "lucide-react";
import type { GraphNodeDto } from "@agentgraph/graph-schema";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { NodePicker } from "@/components/node-picker";
import { GraphCanvas } from "@/components/graph/graph-canvas";
import { GraphLegend } from "@/components/graph/graph-legend";
import { SaveViewButton } from "@/components/save-view-button";
import { useLineage } from "@/hooks/use-analysis";
import { nodeName } from "@/lib/node-display";

export const Route = createFileRoute("/analysis/lineage")({
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
            <label className="text-xs font-medium text-muted-foreground">Dataset</label>
            <NodePicker label="Dataset" value={selected} onSelect={setSelected} />
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
      )}
    </AppShell>
  );
}

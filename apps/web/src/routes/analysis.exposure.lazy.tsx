import { useState } from "react";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { CYPHER_EXPLAINERS, exposureQuery, type GraphNodeDto } from "@agentgraph/graph-schema";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { CypherPanel } from "@/components/cypher-panel";
import { TableSkeleton } from "@/components/skeletons";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";
import { useExposure } from "@/hooks/use-analysis";
import { NODE_DISPLAY, nodeName } from "@/lib/node-display";

export const Route = createLazyFileRoute("/analysis/exposure")({
  component: ExposurePage,
});

function ExposurePage() {
  const [sensitivity, setSensitivity] = useState<"pii" | "confidential">("pii");
  const query = useExposure(sensitivity);

  return (
    <AppShell
      title="Sensitive-Data Exposure"
      description="Which agents can transitively reach sensitive data — and how many hops away."
    >
      <Card className="mb-4">
        <CardContent className="pt-5">
          <Tabs value={sensitivity} onValueChange={(v) => setSensitivity(v as typeof sensitivity)}>
            <TabsList aria-label="Sensitivity level">
              <TabsTrigger value="pii">PII</TabsTrigger>
              <TabsTrigger value="confidential">Confidential</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {query.isLoading ? (
        <TableSkeleton columns={["Agent", "Dataset", "Hops", "Path"]} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data?.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No exposure found" description={`No agent can currently reach ${sensitivity} data.`} />
      ) : (
        <FadeIn className="space-y-4">
          <CypherPanel explainer={CYPHER_EXPLAINERS.exposure} cypher={exposureQuery(6)} params={{ sensitivity }} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Dataset</TableHead>
                <TableHead>Hops</TableHead>
                <TableHead>Path</TableHead>
              </TableRow>
            </TableHeader>
            <StaggerGroup as="tbody" staggerDelay={0.02} className="[&_tr:last-child]:border-0">
              {query.data?.map((p, i) => (
                <StaggerItem as="tr" key={`${p.agent.id}-${p.dataset.id}-${i}`} className="border-b border-border transition-colors hover:bg-secondary/40">
                  <TableCell>
                    <Link to="/catalog/$label/$id" params={{ label: "Agent", id: String(p.agent.properties.id) }} className="font-medium hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
                      {nodeName(p.agent.properties)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link to="/catalog/$label/$id" params={{ label: "Dataset", id: String(p.dataset.properties.id) }} className="hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
                      {nodeName(p.dataset.properties)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.hops <= 2 ? "destructive" : p.hops <= 4 ? "warning" : "outline"}>
                      {p.hops} hop{p.hops === 1 ? "" : "s"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                      {p.path.map((node: GraphNodeDto, idx: number) => (
                        <span key={node.id} className="flex items-center gap-1">
                          {idx > 0 && <span>→</span>}
                          <span className={NODE_DISPLAY[node.label].color}>{nodeName(node.properties)}</span>
                        </span>
                      ))}
                    </div>
                  </TableCell>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </Table>
        </FadeIn>
      )}
    </AppShell>
  );
}

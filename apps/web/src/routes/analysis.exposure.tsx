import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useExposure } from "@/hooks/use-analysis";
import { NODE_DISPLAY, nodeName } from "@/lib/node-display";

export const Route = createFileRoute("/analysis/exposure")({
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
            <TabsList>
              <TabsTrigger value="pii">PII</TabsTrigger>
              <TabsTrigger value="confidential">Confidential</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data?.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No exposure found" description={`No agent can currently reach ${sensitivity} data.`} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Dataset</TableHead>
              <TableHead>Hops</TableHead>
              <TableHead>Path</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data?.map((p, i) => (
              <TableRow key={`${p.agent.id}-${p.dataset.id}-${i}`}>
                <TableCell>
                  <Link to="/catalog/$label/$id" params={{ label: "Agent", id: String(p.agent.properties.id) }} className="font-medium hover:underline">
                    {nodeName(p.agent.properties)}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to="/catalog/$label/$id" params={{ label: "Dataset", id: String(p.dataset.properties.id) }} className="hover:underline">
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
                    {p.path.map((node, idx) => (
                      <span key={node.id} className="flex items-center gap-1">
                        {idx > 0 && <span>→</span>}
                        <span className={NODE_DISPLAY[node.label].color}>{nodeName(node.properties)}</span>
                      </span>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </AppShell>
  );
}

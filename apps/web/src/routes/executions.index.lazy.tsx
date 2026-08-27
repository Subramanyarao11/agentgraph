import { useState } from "react";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { TableSkeleton } from "@/components/skeletons";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";
import { useCatalogList } from "@/hooks/use-catalog";
import { formatCellValue } from "@/lib/format";

export const Route = createLazyFileRoute("/executions/")({
  component: ExecutionsPage,
});

const PAGE_SIZE = 25;

function ExecutionsPage() {
  const [offset, setOffset] = useState(0);
  const query = useCatalogList("Execution", { limit: PAGE_SIZE, offset });
  const items = [...(query.data?.items ?? [])].sort((a, b) =>
    String(b.properties.startedAt ?? "").localeCompare(String(a.properties.startedAt ?? "")),
  );

  return (
    <AppShell title="Executions" description="Every recorded workflow run in the graph.">
      {query.isLoading ? (
        <TableSkeleton columns={["Execution", "Status", "Started", "Duration", ""]} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState icon={PlayCircle} title="No executions yet" description="Run the seed script to populate demo data." />
      ) : (
        <FadeIn>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Execution</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <StaggerGroup as="tbody" staggerDelay={0.015} className="[&_tr:last-child]:border-0">
              {items.map((item) => (
                <StaggerItem as="tr" key={item.id} className="border-b border-border transition-colors hover:bg-secondary/40">
                  <TableCell className="font-mono text-xs text-tertiary-foreground">{String(item.properties.id).slice(0, 8)}</TableCell>
                  <TableCell>
                    <StatusBadge status={String(item.properties.status)} />
                  </TableCell>
                  <TableCell>{formatCellValue("startedAt", item.properties.startedAt)}</TableCell>
                  <TableCell>{formatCellValue("durationMs", item.properties.durationMs)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/executions/$id" params={{ id: String(item.properties.id) }}>
                        Trace
                      </Link>
                    </Button>
                  </TableCell>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </Table>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-tertiary-foreground">
              Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, query.data?.total ?? 0)} of {query.data?.total ?? 0}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={offset + PAGE_SIZE >= (query.data?.total ?? 0)}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </FadeIn>
      )}
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === "success" ? "success" : status === "failed" ? "destructive" : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

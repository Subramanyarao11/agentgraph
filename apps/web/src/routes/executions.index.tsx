import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useCatalogList } from "@/hooks/use-catalog";
import { formatCellValue } from "@/lib/format";

export const Route = createFileRoute("/executions/")({
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
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState icon={PlayCircle} title="No executions yet" description="Run the seed script to populate demo data." />
      ) : (
        <>
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
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{String(item.properties.id).slice(0, 8)}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, query.data?.total ?? 0)} of {query.data?.total ?? 0}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={offset + PAGE_SIZE >= (query.data?.total ?? 0)}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === "success" ? "success" : status === "failed" ? "destructive" : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

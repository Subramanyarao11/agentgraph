import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useCatalogList } from "@/hooks/use-catalog";
import { CATALOG_COLUMNS } from "@/lib/catalog-columns";
import { formatCellValue } from "@/lib/format";
import { NODE_DISPLAY, nodeName } from "@/lib/node-display";
import { SENSITIVITY_VARIANT } from "@/lib/node-display";

// `label` is validated once by the parent /catalog/$label layout route.
export const Route = createFileRoute("/catalog/$label/")({
  component: CatalogListPage,
});

const PAGE_SIZE = 25;

function CatalogListPage() {
  const { label } = Route.useParams();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const display = NODE_DISPLAY[label];
  const columns = CATALOG_COLUMNS[label];

  const query = useCatalogList(label, { limit: PAGE_SIZE, offset, search: search || undefined });

  return (
    <AppShell title={display.plural} description={`Browse every ${label} node in the graph.`}>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${display.plural.toLowerCase()}…`}
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOffset(0);
            }}
          />
        </div>
        {query.data && (
          <span className="text-xs text-muted-foreground">{query.data.total} total</span>
        )}
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data && query.data.items.length === 0 ? (
        <EmptyState
          icon={display.icon}
          title={`No ${display.plural.toLowerCase()} found`}
          description={search ? "Try a different search term." : "Run the seed script to populate demo data."}
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {columns.map((col) => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{nodeName(item.properties)}</TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.key} className="text-muted-foreground">
                      <ColumnValue columnKey={col.key} value={item.properties[col.key]} />
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/catalog/$label/$id" params={{ label, id: String(item.properties.id) }}>
                        View
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

function ColumnValue({ columnKey, value }: { columnKey: string; value: unknown }) {
  if (columnKey === "sensitivity" && typeof value === "string") {
    return <Badge variant={SENSITIVITY_VARIANT[value as keyof typeof SENSITIVITY_VARIANT]}>{value}</Badge>;
  }
  if ((columnKey === "status" || columnKey === "riskLevel") && typeof value === "string") {
    const variant = value === "active" || value === "success" || value === "low" ? "success" : value === "high" || value === "failed" ? "destructive" : "secondary";
    return <Badge variant={variant}>{value}</Badge>;
  }
  return <>{formatCellValue(columnKey, value)}</>;
}

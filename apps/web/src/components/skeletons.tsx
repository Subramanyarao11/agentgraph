import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/** Mirrors the shape of the catalog/exposure tables while data loads — same column count, no layout shift on data-in. */
export function TableSkeleton({ columns, rows = 8 }: { columns: string[]; rows?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((c) => (
            <TableHead key={c}>{c}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {columns.map((c, j) => (
              <TableCell key={c}>
                <Skeleton className="h-4" style={{ width: j === 0 ? "70%" : "45%" }} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** Mirrors a grid of result cards (Similar Agents, Similarity Leaderboard-style layouts). */
export function CardGridSkeleton({ count = 4, columns = 2 }: { count?: number; columns?: 1 | 2 }) {
  return (
    <div className={columns === 2 ? "grid grid-cols-1 gap-3 md:grid-cols-2" : "space-y-3"}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton className="h-3 w-20" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Mirrors a simple vertical list of rows (recent executions, saved views, similar-agent picks). */
export function ListSkeleton({ rows = 5, rowClassName = "h-10" }: { rows?: number; rowClassName?: string }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`w-full ${rowClassName}`} />
      ))}
    </div>
  );
}

/** Mirrors the dashboard's 5-up stat tile row. */
export function StatTilesSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-2.5 h-7 w-14" />
        </Card>
      ))}
    </div>
  );
}

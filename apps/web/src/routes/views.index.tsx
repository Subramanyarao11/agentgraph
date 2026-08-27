import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useDeleteSavedView, useSavedViews } from "@/hooks/use-views";

export const Route = createFileRoute("/views/")({
  component: SavedViewsPage,
});

function SavedViewsPage() {
  const query = useSavedViews();
  const remove = useDeleteSavedView();

  return (
    <AppShell
      title="Saved Views"
      description="Bookmarked analysis configurations, stored in Postgres — click Save view from any Analysis page."
    >
      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data?.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved views yet"
          description="Run an Impact, Lineage, Exposure, or Similar Agents analysis, then click 'Save view'."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {query.data?.map((view) => (
            <Card key={view.id}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>{view.name}</CardTitle>
                  <CardDescription>{new Date(view.createdAt).toLocaleString()}</CardDescription>
                </div>
                <Badge variant="secondary">{view.type}</Badge>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <code className="rounded bg-secondary px-2 py-1 text-xs text-muted-foreground">
                  {JSON.stringify(view.params)}
                </code>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(view.id)} disabled={remove.isPending}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

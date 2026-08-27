import { useState } from "react";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Trash2 } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import type { SavedViewDto } from "@agentgraph/graph-schema";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { CardGridSkeleton } from "@/components/skeletons";
import { StaggerGroup, StaggerItem } from "@/components/motion";
import { useDeleteSavedView, useSavedViews } from "@/hooks/use-views";

export const Route = createLazyFileRoute("/views/")({
  component: SavedViewsPage,
});

function SavedViewsPage() {
  const query = useSavedViews();
  const remove = useDeleteSavedView();
  const [pendingDelete, setPendingDelete] = useState<SavedViewDto | null>(null);

  return (
    <AppShell
      title="Saved Views"
      description="Bookmarked analysis configurations, stored in Postgres — click Save view from any Analysis page."
    >
      {query.isLoading ? (
        <CardGridSkeleton count={4} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data?.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved views yet"
          description="Run an Impact, Lineage, Exposure, or Similar Agents analysis, then click 'Save view'."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/analysis/impact">Go to Impact Analysis</Link>
            </Button>
          }
        />
      ) : (
        <StaggerGroup className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* No `layout` prop / mode="popLayout" here — those need framer-motion's
              larger domMax feature bundle for layout projection. The domAnimation
              bundle (see root route) covers the fade+scale exit fine; remaining
              cards just reflow via normal CSS grid instead of animating into the gap. */}
          <AnimatePresence>
            {query.data?.map((view) => (
              <m.div key={view.id} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.15 }}>
                <StaggerItem>
                  <Card>
                    <CardHeader className="flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle>{view.name}</CardTitle>
                        <CardDescription>{new Date(view.createdAt).toLocaleString()}</CardDescription>
                      </div>
                      <Badge variant="secondary">{view.type}</Badge>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <code className="rounded bg-secondary px-2 py-1 text-xs text-tertiary-foreground">
                        {JSON.stringify(view.params)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete saved view "${view.name}"`}
                        onClick={() => setPendingDelete(view)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive-text" aria-hidden="true" />
                      </Button>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </m.div>
            ))}
          </AnimatePresence>
        </StaggerGroup>
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name}"?`}
        description="This removes the saved view permanently. The underlying analysis and data aren't affected."
        confirmLabel="Delete"
        isPending={remove.isPending}
        onConfirm={() => {
          if (!pendingDelete) return;
          remove.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
      />
    </AppShell>
  );
}

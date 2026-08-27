import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/error-state";
import { useExecutionTrace } from "@/hooks/use-analysis";
import { NODE_DISPLAY, nodeName } from "@/lib/node-display";
import { formatCellValue } from "@/lib/format";

export const Route = createFileRoute("/executions/$id")({
  component: ExecutionTracePage,
});

function ExecutionTracePage() {
  const { id } = Route.useParams();
  const query = useExecutionTrace(id);

  return (
    <AppShell
      title="Execution Trace"
      description={`Full provenance for run ${id.slice(0, 8)}`}
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to="/executions">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Executions
          </Link>
        </Button>
      }
    >
      {query.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-5">
            <div className="flex flex-1 items-center gap-6 text-sm">
              <Field label="Status">
                <Badge variant={query.data.execution.properties.status === "success" ? "success" : query.data.execution.properties.status === "failed" ? "destructive" : "secondary"}>
                  {String(query.data.execution.properties.status)}
                </Badge>
              </Field>
              <Field label="Started">{formatCellValue("startedAt", query.data.execution.properties.startedAt)}</Field>
              <Field label="Duration">{formatCellValue("durationMs", query.data.execution.properties.durationMs)}</Field>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Triggered by</CardTitle>
                <CardDescription>The agent that ran this workflow.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  to="/catalog/$label/$id"
                  params={{ label: "Agent", id: String(query.data.triggeredBy.properties.id) }}
                  className="flex items-center gap-2 text-sm font-medium hover:underline"
                >
                  <NODE_DISPLAY.Agent.icon className="h-4 w-4 text-primary" />
                  {nodeName(query.data.triggeredBy.properties)}
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow</CardTitle>
                <CardDescription>The workflow definition that was run.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  to="/catalog/$label/$id"
                  params={{ label: "Workflow", id: String(query.data.workflow.properties.id) }}
                  className="flex items-center gap-2 text-sm font-medium hover:underline"
                >
                  <NODE_DISPLAY.Workflow.icon className="h-4 w-4 text-emerald-500" />
                  {nodeName(query.data.workflow.properties)}
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Datasets touched</CardTitle>
              <CardDescription>What this run read from or wrote to.</CardDescription>
            </CardHeader>
            <CardContent>
              {query.data.touched.length === 0 ? (
                <p className="text-sm text-muted-foreground">No dataset access recorded for this run.</p>
              ) : (
                <ul className="space-y-2">
                  {query.data.touched.map((t, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <Link
                        to="/catalog/$label/$id"
                        params={{ label: "Dataset", id: String(t.dataset?.properties.id) }}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <NODE_DISPLAY.Dataset.icon className="h-3.5 w-3.5 text-rose-500" />
                        {t.dataset ? nodeName(t.dataset.properties) : "Unknown"}
                      </Link>
                      <Badge variant="outline">{t.access}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

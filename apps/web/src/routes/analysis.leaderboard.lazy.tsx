import { useState } from "react";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";
import { useEnqueueSimilarityLeaderboard, useJobStatus } from "@/hooks/use-jobs";
import { nodeName } from "@/lib/node-display";

export const Route = createLazyFileRoute("/analysis/leaderboard")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [jobId, setJobId] = useState<string | undefined>();
  const enqueue = useEnqueueSimilarityLeaderboard();
  const status = useJobStatus(jobId);

  const isRunning = status.data?.status === "waiting" || status.data?.status === "active";

  return (
    <AppShell
      title="Similarity Leaderboard"
      description="All-pairs agent similarity across the whole graph — an O(n²) computation, run as a background job."
    >
      <Card className="mb-4">
        <CardContent className="flex items-center justify-between pt-5">
          <div>
            <p className="text-sm font-medium">Recompute leaderboard</p>
            <p className="text-xs text-muted-foreground">
              Runs on a BullMQ worker, off the request path. Watch it move through queued → running → complete.
            </p>
          </div>
          <Button
            onClick={() => enqueue.mutate(undefined, { onSuccess: (data) => setJobId(data.jobId) })}
            disabled={enqueue.isPending || isRunning}
          >
            {(enqueue.isPending || isRunning) && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {isRunning ? "Running…" : "Compute leaderboard"}
          </Button>
        </CardContent>
      </Card>

      {!jobId ? (
        <EmptyState icon={Trophy} title="No job run yet" description="Click 'Compute leaderboard' to kick off the background job." />
      ) : status.isError ? (
        <ErrorState error={status.error} onRetry={() => status.refetch()} />
      ) : status.data?.status === "failed" ? (
        <ErrorState error={new Error(status.data.failedReason ?? "Job failed")} />
      ) : (
        <FadeIn>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Top agent pairs by shared tools</CardTitle>
                <CardDescription>Job {jobId.slice(0, 8)}</CardDescription>
              </div>
              <JobStatusBadge status={status.data?.status} />
            </CardHeader>
            {/* Visually redundant with the badge/spinner above — exists purely so a screen
                reader announces each state transition (queued → running → complete) without
                the user needing to re-poll the page. */}
            <p className="sr-only" role="status" aria-live="polite">
              {isRunning
                ? "Similarity leaderboard job is running."
                : status.data?.status === "completed"
                  ? `Similarity leaderboard job complete, ${status.data.result?.length ?? 0} pairs found.`
                  : ""}
            </p>
            <CardContent>
              {isRunning || !status.data?.result ? (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Computing across the graph…
                </div>
              ) : status.data.result.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No agent pairs share 2+ tools yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent A</TableHead>
                      <TableHead>Agent B</TableHead>
                      <TableHead>Shared tools</TableHead>
                    </TableRow>
                  </TableHeader>
                  <StaggerGroup as="tbody" staggerDelay={0.02} className="[&_tr:last-child]:border-0">
                    {status.data.result.map((pair, i) => (
                      <StaggerItem as="tr" key={i} className="border-b border-border transition-colors hover:bg-secondary/40">
                        <TableCell>
                          <Link to="/catalog/$label/$id" params={{ label: "Agent", id: String(pair.agentA.properties.id) }} className="hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
                            {nodeName(pair.agentA.properties)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link to="/catalog/$label/$id" params={{ label: "Agent", id: String(pair.agentB.properties.id) }} className="hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
                            {nodeName(pair.agentB.properties)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{pair.sharedTools}</Badge>
                        </TableCell>
                      </StaggerItem>
                    ))}
                  </StaggerGroup>
                </Table>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </AppShell>
  );
}

function JobStatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const variant = status === "completed" ? "success" : status === "failed" ? "destructive" : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

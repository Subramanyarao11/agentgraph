import { createLazyFileRoute } from "@tanstack/react-router";
import { Activity, Clock, Database, ListTree, Server } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatTile } from "@/components/stat-tile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { StatTilesSkeleton, TableSkeleton } from "@/components/skeletons";
import { FadeIn } from "@/components/motion";
import { useObservabilityLog, useObservabilitySummary } from "@/hooks/use-observability";

export const Route = createLazyFileRoute("/observability")({
  component: ObservabilityPage,
});

function formatMs(ms: number): string {
  return ms < 1000 ? `${ms.toFixed(1)}ms` : `${(ms / 1000).toFixed(2)}s`;
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function ObservabilityPage() {
  const summary = useObservabilitySummary();
  const log = useObservabilityLog();

  return (
    <AppShell
      title="Observability"
      description="Live request tracing, Cypher query timing, and job queue depth for this API process — no external collector, polled every 5s."
    >
      {summary.isLoading ? (
        <StatTilesSkeleton count={5} />
      ) : summary.isError ? (
        <ErrorState error={summary.error} onRetry={() => summary.refetch()} />
      ) : (
        summary.data && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatTile label="Uptime" value={formatUptime(summary.data.uptimeSeconds)} icon={Clock} />
            <StatTile
              label="Graph DB"
              value={summary.data.graphConnected ? "Connected" : "Down"}
              icon={Database}
              tone={summary.data.graphConnected ? "default" : "destructive"}
            />
            <StatTile
              label="Requests (p95)"
              value={formatMs(summary.data.requests.p95Ms)}
              icon={Server}
              tone={summary.data.requests.errorCount > 0 ? "warning" : "default"}
            />
            <StatTile
              label="Cypher queries (p95)"
              value={formatMs(summary.data.queries.p95Ms)}
              icon={ListTree}
              tone={summary.data.queries.errorCount > 0 ? "warning" : "default"}
            />
            <StatTile
              label="Jobs in flight"
              value={summary.data.queue.waiting + summary.data.queue.active}
              icon={Activity}
            />
          </div>
        )
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle>Requests by route</CardTitle>
              <CardDescription>
                {summary.data ? `${summary.data.requests.total} requests, ${summary.data.requests.errorCount} errored, since boot.` : " "}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summary.isLoading ? (
                <TableSkeleton columns={["Route", "Count", "Errors", "Avg", "p95"]} rows={4} />
              ) : summary.data && summary.data.requests.byRoute.length === 0 ? (
                <EmptyState icon={Server} title="No requests yet" description="Traffic will appear here as it happens." />
              ) : (
                summary.data && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Errors</TableHead>
                        <TableHead>Avg</TableHead>
                        <TableHead>p95</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.data.requests.byRoute.map((r) => (
                        <TableRow key={r.route}>
                          <TableCell className="font-mono text-xs">{r.route}</TableCell>
                          <TableCell>{r.count}</TableCell>
                          <TableCell>
                            {r.errorCount > 0 ? <Badge variant="destructive">{r.errorCount}</Badge> : "0"}
                          </TableCell>
                          <TableCell>{formatMs(r.avgMs)}</TableCell>
                          <TableCell>{formatMs(r.p95Ms)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Card>
            <CardHeader>
              <CardTitle>Cypher queries by name</CardTitle>
              <CardDescription>
                {summary.data ? `${summary.data.queries.total} queries, ${summary.data.queries.errorCount} errored, since boot.` : " "}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summary.isLoading ? (
                <TableSkeleton columns={["Query", "Count", "Errors", "Avg", "p95"]} rows={4} />
              ) : summary.data && summary.data.queries.byName.length === 0 ? (
                <EmptyState icon={ListTree} title="No queries yet" description="Cypher executions will appear here as they run." />
              ) : (
                summary.data && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Query</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Errors</TableHead>
                        <TableHead>Avg</TableHead>
                        <TableHead>p95</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.data.queries.byName.map((q) => (
                        <TableRow key={q.name}>
                          <TableCell className="font-mono text-xs">{q.name}</TableCell>
                          <TableCell>{q.count}</TableCell>
                          <TableCell>
                            {q.errorCount > 0 ? <Badge variant="destructive">{q.errorCount}</Badge> : "0"}
                          </TableCell>
                          <TableCell>{formatMs(q.avgMs)}</TableCell>
                          <TableCell>{formatMs(q.p95Ms)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      <FadeIn delay={0.1} className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>The last requests and Cypher queries this process handled, most recent first.</CardDescription>
          </CardHeader>
          <CardContent>
            {log.isLoading ? (
              <TableSkeleton columns={["Method", "Route", "Status", "Duration", "Time"]} rows={6} />
            ) : log.isError ? (
              <ErrorState error={log.error} onRetry={() => log.refetch()} />
            ) : (
              <Tabs defaultValue="requests">
                <TabsList aria-label="Recent activity type">
                  <TabsTrigger value="requests">Requests</TabsTrigger>
                  <TabsTrigger value="queries">Queries</TabsTrigger>
                </TabsList>
                <TabsContent value="requests">
                  {log.data && log.data.requests.length === 0 ? (
                    <EmptyState icon={Server} title="No requests logged yet" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Method</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {log.data?.requests.slice(0, 25).map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-mono text-xs">{r.method}</TableCell>
                            <TableCell className="font-mono text-xs">{r.route}</TableCell>
                            <TableCell>
                              <Badge variant={r.statusCode >= 400 ? "destructive" : "success"}>{r.statusCode}</Badge>
                            </TableCell>
                            <TableCell>{formatMs(r.durationMs)}</TableCell>
                            <TableCell className="text-tertiary-foreground">
                              {new Date(r.timestamp).toLocaleTimeString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
                <TabsContent value="queries">
                  {log.data && log.data.queries.length === 0 ? (
                    <EmptyState icon={ListTree} title="No queries logged yet" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Query</TableHead>
                          <TableHead>Mode</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {log.data?.queries.slice(0, 25).map((q) => (
                          <TableRow key={q.id}>
                            <TableCell className="font-mono text-xs">{q.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{q.mode}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={q.ok ? "success" : "destructive"}>{q.ok ? "ok" : "error"}</Badge>
                            </TableCell>
                            <TableCell>{formatMs(q.durationMs)}</TableCell>
                            <TableCell className="text-tertiary-foreground">
                              {new Date(q.timestamp).toLocaleTimeString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </AppShell>
  );
}

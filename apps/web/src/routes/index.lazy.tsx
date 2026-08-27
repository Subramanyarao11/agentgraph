import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { Bot, Database, PlayCircle, ShieldAlert, Wrench, Workflow as WorkflowIcon } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatTile } from "@/components/stat-tile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/skeletons";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";
import { useCatalogList } from "@/hooks/use-catalog";
import { useExposure } from "@/hooks/use-analysis";

export const Route = createLazyFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const agents = useCatalogList("Agent", { limit: 1 });
  const tools = useCatalogList("Tool", { limit: 1 });
  const workflows = useCatalogList("Workflow", { limit: 1 });
  const datasets = useCatalogList("Dataset", { limit: 1 });
  const recentExecutions = useCatalogList("Execution", { limit: 8 });
  const piiExposure = useExposure("pii");

  const exposedAgentCount = new Set(piiExposure.data?.map((p) => p.agent.id)).size;

  const recent = [...(recentExecutions.data?.items ?? [])].sort((a, b) =>
    String(b.properties.startedAt ?? "").localeCompare(String(a.properties.startedAt ?? "")),
  );

  return (
    <AppShell title="Dashboard" description="Overview of your agentic workflow graph">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatTile label="Agents" value={agents.data?.total ?? 0} icon={Bot} loading={agents.isLoading} />
        <StatTile label="Tools" value={tools.data?.total ?? 0} icon={Wrench} loading={tools.isLoading} />
        <StatTile
          label="Workflows"
          value={workflows.data?.total ?? 0}
          icon={WorkflowIcon}
          loading={workflows.isLoading}
        />
        <StatTile label="Datasets" value={datasets.data?.total ?? 0} icon={Database} loading={datasets.isLoading} />
        <StatTile
          label="Agents reaching PII"
          value={exposedAgentCount}
          icon={ShieldAlert}
          tone={exposedAgentCount > 0 ? "warning" : "default"}
          loading={piiExposure.isLoading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <FadeIn delay={0.05} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent executions</CardTitle>
              <CardDescription>The latest agent-triggered workflow runs across the graph.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentExecutions.isLoading ? (
                <ListSkeleton rows={5} rowClassName="h-9" />
              ) : recent.length === 0 ? (
                <EmptyState icon={PlayCircle} title="No executions yet" description="Run the seed script to populate demo data." />
              ) : (
                <StaggerGroup className="divide-y divide-border">
                  {recent.map((exec) => (
                    <StaggerItem key={exec.id}>
                      <Link
                        to="/executions/$id"
                        params={{ id: String(exec.properties.id) }}
                        className="flex items-center justify-between rounded-md px-1.5 py-2.5 text-sm transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                      >
                        <span className="font-mono text-xs text-tertiary-foreground">
                          {String(exec.properties.id).slice(0, 8)}
                        </span>
                        <span className="text-tertiary-foreground">
                          {new Date(String(exec.properties.startedAt)).toLocaleString()}
                        </span>
                        <StatusBadge status={String(exec.properties.status)} />
                      </Link>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Why a graph here?</CardTitle>
              <CardDescription>What this app is for.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Agents, tools, workflows, and the data they touch form a dense web of many-to-many
                relationships. Questions like <em>"what breaks if this tool goes down"</em> or{" "}
                <em>"which agents can reach PII, however indirectly"</em> are multi-hop traversals —
                natural in Cypher, expensive joins in SQL.
              </p>
              <p>Start with Impact Analysis or Sensitive-Data Exposure in the sidebar to see it live.</p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === "success" ? "success" : status === "failed" ? "destructive" : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

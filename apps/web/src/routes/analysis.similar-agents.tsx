import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { CYPHER_EXPLAINERS, SIMILAR_AGENTS_QUERY, type GraphNodeDto } from "@agentgraph/graph-schema";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { NodePicker } from "@/components/node-picker";
import { CypherPanel } from "@/components/cypher-panel";
import { SaveViewButton } from "@/components/save-view-button";
import { useSimilarAgents } from "@/hooks/use-analysis";
import { nodeName } from "@/lib/node-display";

export const Route = createFileRoute("/analysis/similar-agents")({
  component: SimilarAgentsPage,
});

function SimilarAgentsPage() {
  const [selected, setSelected] = useState<GraphNodeDto | null>(null);
  const agentId = selected?.properties.id as string | undefined;
  const query = useSimilarAgents(agentId, 8);

  return (
    <AppShell
      title="Similar Agents"
      description="Recommended by shared tool usage — a Jaccard-style similarity over the graph."
      actions={selected && <SaveViewButton type="similar-agents" params={{ agentId }} defaultName={`Similar to ${nodeName(selected.properties)}`} />}
    >
      <Card className="mb-4">
        <CardContent className="pt-5">
          <div className="w-72 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Agent</label>
            <NodePicker label="Agent" value={selected} onSelect={setSelected} />
          </div>
        </CardContent>
      </Card>

      {!selected ? (
        <EmptyState icon={Sparkles} title="Pick an agent" description="Choose an agent above to find others that share its tools." />
      ) : query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data?.length === 0 ? (
        <EmptyState icon={Sparkles} title="No similar agents" description="No other agent shares a tool with this one yet." />
      ) : (
        <div className="space-y-4">
          <CypherPanel explainer={CYPHER_EXPLAINERS.similarAgents} cypher={SIMILAR_AGENTS_QUERY} params={{ agentId, limit: 8 }} />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {query.data?.map((result) => (
            <Card key={result.agent.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>
                    <Link to="/catalog/$label/$id" params={{ label: "Agent", id: String(result.agent.properties.id) }} className="hover:underline">
                      {nodeName(result.agent.properties)}
                    </Link>
                  </CardTitle>
                  <CardDescription>{String(result.agent.properties.role ?? "")}</CardDescription>
                </div>
                <Badge>{Math.round(result.score * 100)}% match</Badge>
              </CardHeader>
              <CardContent>
                <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.round(result.score * 100))}%` }} />
                </div>
                <p className="mb-1.5 text-xs text-muted-foreground">{result.sharedTools} shared tool{result.sharedTools === 1 ? "" : "s"}</p>
                <div className="flex flex-wrap gap-1">
                  {result.sharedToolNames.map((name) => (
                    <Badge key={name} variant="secondary">
                      {name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}

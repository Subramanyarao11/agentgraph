import { useState } from "react";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { m } from "framer-motion";
import { CYPHER_EXPLAINERS, SIMILAR_AGENTS_QUERY, type GraphNodeDto } from "@agentgraph/graph-schema";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { NodePicker } from "@/components/node-picker";
import { CypherPanel } from "@/components/cypher-panel";
import { SaveViewButton } from "@/components/save-view-button";
import { CardGridSkeleton } from "@/components/skeletons";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";
import { useSimilarAgents } from "@/hooks/use-analysis";
import { nodeName } from "@/lib/node-display";

export const Route = createLazyFileRoute("/analysis/similar-agents")({
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
            <label htmlFor="similar-agents-node-picker" className="text-xs font-medium text-muted-foreground">
              Agent
            </label>
            <NodePicker id="similar-agents-node-picker" label="Agent" value={selected} onSelect={setSelected} />
          </div>
        </CardContent>
      </Card>

      {!selected ? (
        <EmptyState icon={Sparkles} title="Pick an agent" description="Choose an agent above to find others that share its tools." />
      ) : query.isLoading ? (
        <CardGridSkeleton count={4} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.data?.length === 0 ? (
        <EmptyState icon={Sparkles} title="No similar agents" description="No other agent shares a tool with this one yet." />
      ) : (
        <FadeIn className="space-y-4">
          <CypherPanel explainer={CYPHER_EXPLAINERS.similarAgents} cypher={SIMILAR_AGENTS_QUERY} params={{ agentId, limit: 8 }} />
          <StaggerGroup className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {query.data?.map((result) => {
              const pct = Math.min(100, Math.round(result.score * 100));
              return (
                <StaggerItem key={result.agent.id}>
                  <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle>
                          <Link to="/catalog/$label/$id" params={{ label: "Agent", id: String(result.agent.properties.id) }} className="hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1">
                            {nodeName(result.agent.properties)}
                          </Link>
                        </CardTitle>
                        <CardDescription>{String(result.agent.properties.role ?? "")}</CardDescription>
                      </div>
                      <Badge>{pct}% match</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <m.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        />
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
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </FadeIn>
      )}
    </AppShell>
  );
}

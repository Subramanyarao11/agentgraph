import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/error-state";
import { GraphCanvas } from "@/components/graph/graph-canvas";
import { GraphLegend } from "@/components/graph/graph-legend";
import { FadeIn } from "@/components/motion";
import { useCatalogDetail } from "@/hooks/use-catalog";
import { NODE_DISPLAY, nodeName, SENSITIVITY_VARIANT } from "@/lib/node-display";
import { formatCellValue } from "@/lib/format";

export const Route = createLazyFileRoute("/catalog/$label/$id")({
  component: CatalogDetailPage,
});

function CatalogDetailPage() {
  const { label, id } = Route.useParams();
  const navigate = useNavigate();
  const query = useCatalogDetail(label, id);
  const display = NODE_DISPLAY[label];

  const center = query.data?.nodes.find((n) => n.properties.id === id) ?? query.data?.nodes[0];
  const labelsInGraph = Array.from(new Set(query.data?.nodes.map((n) => n.label) ?? []));

  return (
    <AppShell
      title={center ? nodeName(center.properties) : label}
      description={label}
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to="/catalog/$label" params={{ label }}>
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to {display.plural}
          </Link>
        </Button>
      }
    >
      {query.isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : !center ? (
        <ErrorState error={new Error("Node not found")} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FadeIn className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>Raw attributes stored on this node.</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2.5 text-sm">
                  {Object.entries(center.properties).map(([key, value]) => (
                    <div key={key} className="flex items-start justify-between gap-3">
                      <dt className="text-muted-foreground">{key}</dt>
                      <dd className="text-right font-medium">
                        {key === "sensitivity" && typeof value === "string" ? (
                          <Badge variant={SENSITIVITY_VARIANT[value as keyof typeof SENSITIVITY_VARIANT]}>{value}</Badge>
                        ) : (
                          formatCellValue(key, value)
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.05} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>1-hop neighborhood</CardTitle>
                <CardDescription>Everything directly connected to this node.</CardDescription>
              </CardHeader>
              <CardContent>
                {query.data && query.data.nodes.length > 1 ? (
                  <>
                    <div className="h-[380px] w-full">
                      <GraphCanvas
                        nodes={query.data.nodes}
                        edges={query.data.edges}
                        highlightId={center.id}
                        onNodeClick={(node) =>
                          node.id !== center.id &&
                          navigate({ to: "/catalog/$label/$id", params: { label: node.label, id: String(node.properties.id) } })
                        }
                      />
                    </div>
                    <div className="mt-3">
                      <GraphLegend labels={labelsInGraph} />
                    </div>
                  </>
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">No connected nodes yet.</p>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      )}
    </AppShell>
  );
}

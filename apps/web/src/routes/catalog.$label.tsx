import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { NodeLabelSchema, type NodeLabel } from "@agentgraph/graph-schema";

// Kept separate from lib/node-display's NODE_DISPLAY (which also carries lucide icon
// components) so this always-eager route file's title lookup doesn't pull icons into
// the main bundle — those stay in the .lazy.tsx chunk where they're actually used.
const PLURAL: Record<NodeLabel, string> = {
  Person: "People",
  Agent: "Agents",
  Tool: "Tools",
  Workflow: "Workflows",
  Step: "Steps",
  Dataset: "Datasets",
  Execution: "Executions",
};

/**
 * Pure layout route: validates `label` once for both children
 * (catalog.$label.index — the list — and catalog.$label.$id — the detail
 * page) and renders whichever matched via Outlet. Neither child re-parses
 * `label`; they read it back through the merged, typed `Route.useParams()`.
 */
export const Route = createFileRoute("/catalog/$label")({
  params: {
    parse: (raw) => {
      const result = NodeLabelSchema.safeParse(raw.label);
      if (!result.success) throw notFound();
      return { label: result.data };
    },
  },
  head: ({ params }) => ({ meta: [{ title: `${PLURAL[params.label]} — AgentGraph` }] }),
  component: () => <Outlet />,
});

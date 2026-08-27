import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { NodeLabelSchema } from "@agentgraph/graph-schema";

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
  component: () => <Outlet />,
});

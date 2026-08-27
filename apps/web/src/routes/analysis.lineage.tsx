import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/analysis/lineage")({
  head: () => ({ meta: [{ title: "Data Lineage — AgentGraph" }] }),
});

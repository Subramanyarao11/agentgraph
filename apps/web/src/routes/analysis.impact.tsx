import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/analysis/impact")({
  head: () => ({ meta: [{ title: "Impact Analysis — AgentGraph" }] }),
});

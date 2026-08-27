import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/observability")({
  head: () => ({ meta: [{ title: "Observability — AgentGraph" }] }),
});

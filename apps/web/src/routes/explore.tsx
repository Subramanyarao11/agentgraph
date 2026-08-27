import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "Graph Explorer — AgentGraph" }] }),
});

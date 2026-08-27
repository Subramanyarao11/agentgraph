import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/analysis/similar-agents")({
  head: () => ({ meta: [{ title: "Similar Agents — AgentGraph" }] }),
});

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/executions/$id")({
  head: () => ({ meta: [{ title: "Execution Trace — AgentGraph" }] }),
});

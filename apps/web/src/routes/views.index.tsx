import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/views/")({
  head: () => ({ meta: [{ title: "Saved Views — AgentGraph" }] }),
});

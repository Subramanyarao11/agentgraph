import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/analysis/exposure")({
  head: () => ({ meta: [{ title: "Sensitive-Data Exposure — AgentGraph" }] }),
});

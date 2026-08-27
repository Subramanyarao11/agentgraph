import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/analysis/leaderboard")({
  head: () => ({ meta: [{ title: "Similarity Leaderboard — AgentGraph" }] }),
});

import { createFileRoute } from "@tanstack/react-router";

// `label` is already validated by the parent /catalog/$label route's parser;
// this leaf route only adds the `$id` segment, so it needs no parser of its own.
export const Route = createFileRoute("/catalog/$label/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.label} detail — AgentGraph` }] }),
});

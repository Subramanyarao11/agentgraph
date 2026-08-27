import { createFileRoute } from "@tanstack/react-router";

// `label` is validated once by the parent /catalog/$label layout route.
export const Route = createFileRoute("/catalog/$label/")({});

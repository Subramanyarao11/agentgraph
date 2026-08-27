import type { NodeLabel } from "@agentgraph/graph-schema";

export interface CatalogColumn {
  key: string;
  label: string;
}

/** Which extra property columns to show per label in catalog tables. */
export const CATALOG_COLUMNS: Record<NodeLabel, CatalogColumn[]> = {
  Person: [
    { key: "email", label: "Email" },
    { key: "team", label: "Team" },
    { key: "title", label: "Title" },
  ],
  Agent: [
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "autonomyLevel", label: "Autonomy" },
  ],
  Tool: [
    { key: "category", label: "Category" },
    { key: "riskLevel", label: "Risk" },
    { key: "authType", label: "Auth" },
  ],
  Workflow: [
    { key: "trigger", label: "Trigger" },
    { key: "status", label: "Status" },
  ],
  Step: [
    { key: "type", label: "Type" },
    { key: "order", label: "Order" },
  ],
  Dataset: [
    { key: "system", label: "System" },
    { key: "sensitivity", label: "Sensitivity" },
  ],
  Execution: [
    { key: "status", label: "Status" },
    { key: "startedAt", label: "Started" },
    { key: "durationMs", label: "Duration" },
  ],
};

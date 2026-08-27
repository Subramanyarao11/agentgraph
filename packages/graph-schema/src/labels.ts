/**
 * Node labels and relationship types as const enums so query strings and
 * schema code reference the same literal values instead of duplicating them.
 */

export const NodeLabel = {
  Person: "Person",
  Agent: "Agent",
  Tool: "Tool",
  Workflow: "Workflow",
  Step: "Step",
  Dataset: "Dataset",
  Execution: "Execution",
} as const;
export type NodeLabel = (typeof NodeLabel)[keyof typeof NodeLabel];

export const RelType = {
  OWNS: "OWNS",
  USES_TOOL: "USES_TOOL",
  EXECUTES: "EXECUTES",
  HAS_STEP: "HAS_STEP",
  NEXT: "NEXT",
  CALLS_TOOL: "CALLS_TOOL",
  READS_FROM: "READS_FROM",
  WRITES_TO: "WRITES_TO",
  DEPENDS_ON: "DEPENDS_ON",
  RAN: "RAN",
  TRIGGERED_BY: "TRIGGERED_BY",
  TOUCHED: "TOUCHED",
} as const;
export type RelType = (typeof RelType)[keyof typeof RelType];

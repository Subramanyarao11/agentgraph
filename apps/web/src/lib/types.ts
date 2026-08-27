import type { GraphNodeDto, GraphResultDto } from "@agentgraph/graph-schema";

export interface AffectedNode {
  node: GraphNodeDto;
  hops: number;
}

export interface ImpactResult {
  affected: AffectedNode[];
  graph: GraphResultDto;
}

export interface ExecutionTrace {
  execution: GraphNodeDto;
  workflow: GraphNodeDto;
  triggeredBy: GraphNodeDto;
  touched: Array<{ dataset: GraphNodeDto | null; access: string | null }>;
}

export type ComponentStatus = "up" | "down";

export interface HealthStatus {
  status: "up" | "degraded";
  components: { graph: ComponentStatus; postgres: ComponentStatus; redis: ComponentStatus };
  timestamp: string;
}

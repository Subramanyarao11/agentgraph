import { z } from "zod";
import { NodeLabel, RelType } from "./labels";

/**
 * Wire-format schemas shared between the API and the web app: request DTOs
 * (validated with these at the Nest controller boundary) and the generic
 * graph-visualization response shape every "explore" endpoint returns.
 */

export const PaginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export type PaginationQuery = z.infer<typeof PaginationQuery>;

export const NodeLabelSchema = z.nativeEnum(NodeLabel);
export const RelTypeSchema = z.nativeEnum(RelType);

/** A node as rendered to the client: label + flattened properties. */
export const GraphNodeDto = z.object({
  id: z.string(),
  label: NodeLabelSchema,
  properties: z.record(z.string(), z.unknown()),
});
export type GraphNodeDto = z.infer<typeof GraphNodeDto>;

/** An edge as rendered to the client. */
export const GraphEdgeDto = z.object({
  id: z.string(),
  type: RelTypeSchema,
  source: z.string(),
  target: z.string(),
  properties: z.record(z.string(), z.unknown()),
});
export type GraphEdgeDto = z.infer<typeof GraphEdgeDto>;

export const GraphResultDto = z.object({
  nodes: z.array(GraphNodeDto),
  edges: z.array(GraphEdgeDto),
});
export type GraphResultDto = z.infer<typeof GraphResultDto>;

/** Blast-radius / impact-analysis request: "if this node breaks, what's affected?" */
export const ImpactAnalysisQuery = z.object({
  nodeId: z.string().uuid(),
  maxHops: z.coerce.number().int().min(1).max(6).default(4),
});
export type ImpactAnalysisQuery = z.infer<typeof ImpactAnalysisQuery>;

/** Data-lineage request: trace how a dataset's data flows through the graph. */
export const LineageQuery = z.object({
  datasetId: z.string().uuid(),
  maxHops: z.coerce.number().int().min(1).max(6).default(4),
});
export type LineageQuery = z.infer<typeof LineageQuery>;

/** Agent-similarity / recommendation request. */
export const SimilarAgentsQuery = z.object({
  agentId: z.string().uuid(),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});
export type SimilarAgentsQuery = z.infer<typeof SimilarAgentsQuery>;

export const SimilarAgentResultDto = z.object({
  agent: GraphNodeDto,
  sharedTools: z.number().int().nonnegative(),
  sharedToolNames: z.array(z.string()),
  score: z.number(),
});
export type SimilarAgentResultDto = z.infer<typeof SimilarAgentResultDto>;

/** PII / sensitive-data exposure query: which agents can reach data of a given sensitivity. */
export const ExposureQuery = z.object({
  sensitivity: z.enum(["confidential", "pii"]).default("pii"),
});
export type ExposureQuery = z.infer<typeof ExposureQuery>;

export const ExposurePathDto = z.object({
  agent: GraphNodeDto,
  dataset: GraphNodeDto,
  hops: z.number().int().nonnegative(),
  path: z.array(GraphNodeDto),
});
export type ExposurePathDto = z.infer<typeof ExposurePathDto>;

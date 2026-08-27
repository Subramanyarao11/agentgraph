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

export const CatalogListQuery = PaginationQuery.extend({
  search: z.string().trim().min(1).max(120).optional(),
});
export type CatalogListQuery = z.infer<typeof CatalogListQuery>;

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

export const CatalogListResultDto = z.object({
  items: z.array(GraphNodeDto),
  total: z.number().int().nonnegative(),
  limit: z.number().int(),
  offset: z.number().int(),
});
export type CatalogListResultDto = z.infer<typeof CatalogListResultDto>;

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

/**
 * Saved analysis views live in Postgres (app-side metadata), not the graph —
 * they're a bookmark of "run analysis X with these params", not part of the
 * domain graph itself.
 */
export const SavedViewType = z.enum(["impact", "lineage", "exposure", "similar-agents"]);
export type SavedViewType = z.infer<typeof SavedViewType>;

export const CreateSavedViewDto = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  type: SavedViewType,
  params: z.record(z.string(), z.unknown()),
});
export type CreateSavedViewDto = z.infer<typeof CreateSavedViewDto>;

export const SavedViewDto = CreateSavedViewDto.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
});
export type SavedViewDto = z.infer<typeof SavedViewDto>;

/**
 * Async similarity-leaderboard job (BullMQ): computing all-pairs agent
 * similarity across the whole graph is O(n^2) in agent count, so it runs as
 * a background job rather than inline on a request.
 */
export const SimilarityPairDto = z.object({
  agentA: GraphNodeDto,
  agentB: GraphNodeDto,
  sharedTools: z.number().int().nonnegative(),
  score: z.number(),
});
export type SimilarityPairDto = z.infer<typeof SimilarityPairDto>;

export const JobStatus = z.enum(["waiting", "active", "completed", "failed", "not_found"]);
export type JobStatus = z.infer<typeof JobStatus>;

export const JobStatusDto = z.object({
  jobId: z.string(),
  status: JobStatus,
  result: z.array(SimilarityPairDto).nullable(),
  failedReason: z.string().nullable(),
});
export type JobStatusDto = z.infer<typeof JobStatusDto>;

/** Global full-text search (⌘K) — backed by CognoDB's fulltext index support. */
export const SearchQuery = z.object({
  q: z.string().trim().min(1).max(120),
});
export type SearchQuery = z.infer<typeof SearchQuery>;

export const SearchResultDto = z.object({
  node: GraphNodeDto,
  score: z.number(),
});
export type SearchResultDto = z.infer<typeof SearchResultDto>;

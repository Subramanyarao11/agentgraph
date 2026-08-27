import { Injectable } from "@nestjs/common";
import {
  EXECUTION_TRACE_QUERY,
  LINEAGE_PATH_QUERY,
  SIMILAR_AGENTS_QUERY,
  SIMILARITY_LEADERBOARD_QUERY,
  exposureQuery,
  impactListQuery,
  impactPathsQuery,
  type ExposurePathDto,
  type GraphResultDto,
  type SimilarAgentResultDto,
  type SimilarityPairDto,
} from "@agentgraph/graph-schema";
import { cypherInt, pathsToGraphResult, toGraphNodeDto, unwrapValue } from "@agentgraph/graph-client";
import type { Node as Neo4jNode, Path } from "neo4j-driver";
import { GraphService } from "../graph/graph.service";

export interface AffectedNode {
  node: ReturnType<typeof toGraphNodeDto>;
  hops: number;
}

export interface ExecutionTrace {
  execution: ReturnType<typeof toGraphNodeDto>;
  workflow: ReturnType<typeof toGraphNodeDto>;
  triggeredBy: ReturnType<typeof toGraphNodeDto>;
  touched: Array<{ dataset: ReturnType<typeof toGraphNodeDto> | null; access: string | null }>;
}

@Injectable()
export class AnalysisService {
  constructor(private readonly graph: GraphService) {}

  /** Blast radius: flat ranked list + a subgraph for visualization. */
  async impact(nodeId: string, maxHops: number): Promise<{ affected: AffectedNode[]; graph: GraphResultDto }> {
    const [listResult, pathsResult] = await Promise.all([
      this.graph.client.readQuery(impactListQuery(maxHops), { nodeId }, "impactList"),
      this.graph.client.readQuery(impactPathsQuery(maxHops), { nodeId }, "impactPaths"),
    ]);

    const affected = listResult.records.map((r) => ({
      node: toGraphNodeDto(r.get("affected") as Neo4jNode),
      hops: Number(unwrapValue(r.get("hops"))),
    }));

    const paths = pathsResult.records.map((r) => r.get("path") as Path);
    return { affected, graph: pathsToGraphResult(paths) };
  }

  /** Data lineage for a dataset: who/what can produce or consume it. */
  async lineage(datasetId: string): Promise<GraphResultDto> {
    const result = await this.graph.client.readQuery(LINEAGE_PATH_QUERY, { datasetId }, "lineage");
    const paths = result.records.map((r) => r.get("path") as Path);
    return pathsToGraphResult(paths);
  }

  /** Agents recommended by shared tool usage with a given agent. */
  async similarAgents(agentId: string, limit: number): Promise<SimilarAgentResultDto[]> {
    const result = await this.graph.client.readQuery(SIMILAR_AGENTS_QUERY, { agentId, limit: cypherInt(limit) }, "similarAgents");
    return result.records.map((r) => ({
      agent: toGraphNodeDto(r.get("other") as Neo4jNode),
      sharedTools: Number(unwrapValue(r.get("sharedTools"))),
      sharedToolNames: r.get("sharedToolNames") as string[],
      score: Number(unwrapValue(r.get("score"))),
    }));
  }

  /** Agents that can transitively reach sensitive datasets, shortest path first. */
  async exposure(sensitivity: "confidential" | "pii", maxHops: number): Promise<ExposurePathDto[]> {
    const result = await this.graph.client.readQuery(exposureQuery(maxHops), { sensitivity }, "exposure");
    return result.records.map((r) => {
      const path = r.get("path") as Path;
      const pathNodes = [path.start, ...path.segments.map((s) => s.end)].map(toGraphNodeDto);
      return {
        agent: toGraphNodeDto(r.get("a") as Neo4jNode),
        dataset: toGraphNodeDto(r.get("d") as Neo4jNode),
        hops: Number(unwrapValue(r.get("hops"))),
        path: pathNodes,
      };
    });
  }

  /** Full provenance of a single execution. */
  async executionTrace(executionId: string): Promise<ExecutionTrace | null> {
    const result = await this.graph.client.readQuery(EXECUTION_TRACE_QUERY, { executionId }, "executionTrace");
    const record = result.records[0];
    if (!record) return null;

    const touched = (record.get("touched") as Array<{ dataset: Neo4jNode | null; access: string | null }>)
      .filter((t) => t.dataset !== null)
      .map((t) => ({ dataset: toGraphNodeDto(t.dataset as Neo4jNode), access: t.access }));

    return {
      execution: toGraphNodeDto(record.get("e") as Neo4jNode),
      workflow: toGraphNodeDto(record.get("w") as Neo4jNode),
      triggeredBy: toGraphNodeDto(record.get("a") as Neo4jNode),
      touched,
    };
  }

  /** All-pairs similarity leaderboard — expensive, called from the BullMQ processor, not a request handler. */
  async similarityLeaderboard(): Promise<SimilarityPairDto[]> {
    const result = await this.graph.client.readQuery(SIMILARITY_LEADERBOARD_QUERY, {}, "similarityLeaderboard");
    return result.records.map((r) => ({
      agentA: toGraphNodeDto(r.get("a") as Neo4jNode),
      agentB: toGraphNodeDto(r.get("b") as Neo4jNode),
      sharedTools: Number(unwrapValue(r.get("sharedTools"))),
      score: Number(unwrapValue(r.get("sharedTools"))),
    }));
  }
}

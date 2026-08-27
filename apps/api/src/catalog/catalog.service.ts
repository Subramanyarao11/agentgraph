import { Injectable } from "@nestjs/common";
import type { CatalogListQuery, CatalogListResultDto, GraphResultDto, NodeLabel } from "@agentgraph/graph-schema";
import { cypherInt, toGraphEdgeDto, toGraphNodeDto, isNeo4jNode, isNeo4jRelationship } from "@agentgraph/graph-client";
import type { Node as Neo4jNode, Relationship } from "neo4j-driver";
import { GraphService } from "../graph/graph.service";

/**
 * Generic read access to any node label in the graph, used to populate
 * catalog tables/pickers in the UI. `label` always comes from the
 * NodeLabel enum (validated by ZodValidationPipe before it reaches here),
 * so interpolating it into Cypher is safe — Cypher has no way to
 * parameterize a label, only property values.
 */
@Injectable()
export class CatalogService {
  constructor(private readonly graph: GraphService) {}

  async list(label: NodeLabel, query: CatalogListQuery): Promise<CatalogListResultDto> {
    const { limit, offset, search } = query;

    const [itemsResult, countResult] = await Promise.all([
      this.graph.client.readQuery(
        `MATCH (n:${label})
         WHERE $search IS NULL OR toLower(n.name) CONTAINS toLower($search)
         RETURN n
         ORDER BY n.name
         SKIP $offset LIMIT $limit`,
        { search: search ?? null, offset: cypherInt(offset), limit: cypherInt(limit) },
        "catalogList",
      ),
      this.graph.client.readQuery(
        `MATCH (n:${label})
         WHERE $search IS NULL OR toLower(n.name) CONTAINS toLower($search)
         RETURN count(n) AS total`,
        { search: search ?? null },
        "catalogCount",
      ),
    ]);

    return {
      items: itemsResult.records.map((r) => toGraphNodeDto(r.get("n") as Neo4jNode)),
      total: Number(countResult.records[0]?.get("total") ?? 0),
      limit,
      offset,
    };
  }

  async getById(label: NodeLabel, id: string): Promise<GraphResultDto | null> {
    const result = await this.graph.client.readQuery(
      `MATCH (n:${label} {id: $id})
       OPTIONAL MATCH (n)-[r]-(m)
       RETURN n, collect(DISTINCT r) AS rels, collect(DISTINCT m) AS neighbors`,
      { id },
      "catalogDetail",
    );

    const record = result.records[0];
    if (!record) return null;

    const center = record.get("n") as Neo4jNode;
    const neighbors = (record.get("neighbors") as unknown[]).filter(isNeo4jNode) as Neo4jNode[];
    const rels = (record.get("rels") as unknown[]).filter(isNeo4jRelationship) as Relationship[];

    const nodeById = new Map<string, Neo4jNode>();
    nodeById.set(center.elementId, center);
    for (const n of neighbors) nodeById.set(n.elementId, n);

    return {
      nodes: [...nodeById.values()].map(toGraphNodeDto),
      edges: rels.map(toGraphEdgeDto),
    };
  }
}

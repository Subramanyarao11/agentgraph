import { Injectable } from "@nestjs/common";
import { SEARCH_QUERY, type SearchResultDto } from "@agentgraph/graph-schema";
import { toGraphNodeDto, unwrapValue } from "@agentgraph/graph-client";
import type { Node as Neo4jNode } from "neo4j-driver";
import { GraphService } from "../graph/graph.service";

@Injectable()
export class SearchService {
  constructor(private readonly graph: GraphService) {}

  async search(term: string): Promise<SearchResultDto[]> {
    const result = await this.graph.client.readQuery(SEARCH_QUERY, { term }, "search");
    return result.records.map((r) => ({
      node: toGraphNodeDto(r.get("node") as Neo4jNode),
      score: Number(unwrapValue(r.get("score"))),
    }));
  }
}

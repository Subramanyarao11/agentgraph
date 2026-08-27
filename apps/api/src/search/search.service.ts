import { Injectable } from "@nestjs/common";
import { FULLTEXT_SEARCH_QUERY, type SearchResultDto } from "@agentgraph/graph-schema";
import { toGraphNodeDto, unwrapValue } from "@agentgraph/graph-client";
import type { Node as Neo4jNode } from "neo4j-driver";
import { GraphService } from "../graph/graph.service";

/** Lucene special characters — escaped so a raw user search term can't break query parsing. */
const LUCENE_SPECIAL_CHARS = /([+\-&|!(){}[\]^"~*?:\\/])/g;

function escapeLuceneTerm(term: string): string {
  return term.replace(LUCENE_SPECIAL_CHARS, "\\$1");
}

@Injectable()
export class SearchService {
  constructor(private readonly graph: GraphService) {}

  async search(term: string): Promise<SearchResultDto[]> {
    const result = await this.graph.client.readQuery(FULLTEXT_SEARCH_QUERY, {
      term: escapeLuceneTerm(term),
    });
    return result.records.map((r) => ({
      node: toGraphNodeDto(r.get("node") as Neo4jNode),
      score: Number(unwrapValue(r.get("score"))),
    }));
  }
}

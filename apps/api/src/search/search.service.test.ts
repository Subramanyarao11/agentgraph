import { describe, expect, it, vi } from "vitest";
import neo4j from "neo4j-driver";
import { SearchService } from "./search.service";
import type { GraphService } from "../graph/graph.service";

function fakeGraphService(records: Array<{ node: unknown; score: number }>) {
  const readQuery = vi.fn(async (_cypher: string, _params?: unknown) => ({
    records: records.map((r) => ({
      get: (key: string) => (key === "node" ? r.node : neo4j.int(r.score)),
    })),
  }));
  return { graph: { client: { readQuery } } as unknown as GraphService, readQuery };
}

describe("SearchService", () => {
  it("passes the raw search term as a query parameter", async () => {
    const { graph, readQuery } = fakeGraphService([]);
    const service = new SearchService(graph);

    await service.search('C++ (backend) AND "on-call"');

    const [, params] = readQuery.mock.calls[0]!;
    expect(params).toEqual({ term: 'C++ (backend) AND "on-call"' });
  });

  it("maps matched nodes with their relevance score", async () => {
    const node = new neo4j.Node(neo4j.int(1), ["Tool"], { id: "t1", name: "Salesforce" }, "4:db:1");
    const { graph } = fakeGraphService([{ node, score: 2 }]);
    const service = new SearchService(graph);

    const results = await service.search("salesforce");

    expect(results).toEqual([{ node: { id: "4:db:1", label: "Tool", properties: { id: "t1", name: "Salesforce" } }, score: 2 }]);
  });
});

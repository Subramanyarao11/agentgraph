import { describe, expect, it, vi } from "vitest";
import neo4j, { type Integer } from "neo4j-driver";
import { CatalogService } from "./catalog.service";
import type { GraphService } from "../graph/graph.service";

function fakeGraphService(itemNodes: unknown[], total: number) {
  const readQuery = vi.fn(async (cypher: string, params?: unknown) => {
    if (cypher.includes("count(n)")) {
      return { records: [{ get: () => neo4j.int(total) }] };
    }
    return { records: itemNodes.map((n) => ({ get: () => n })) };
  });
  return { graph: { client: { readQuery } } as unknown as GraphService, readQuery };
}

describe("CatalogService.list", () => {
  it("wraps limit/offset as Bolt Integers, never plain numbers", async () => {
    const { graph, readQuery } = fakeGraphService([], 0);
    const service = new CatalogService(graph);

    await service.list("Agent", { limit: 25, offset: 50, search: undefined });

    const [, listParams] = readQuery.mock.calls[0]!;
    expect(neo4j.isInt((listParams as { limit: unknown }).limit)).toBe(true);
    expect(neo4j.isInt((listParams as { offset: unknown }).offset)).toBe(true);
    expect((listParams as { limit: Integer }).limit.toNumber()).toBe(25);
  });

  it("passes null (not undefined) for an omitted search term, since Cypher params can't be undefined", async () => {
    const { graph, readQuery } = fakeGraphService([], 0);
    const service = new CatalogService(graph);

    await service.list("Tool", { limit: 10, offset: 0, search: undefined });

    const [, listParams] = readQuery.mock.calls[0]!;
    expect((listParams as { search: unknown }).search).toBeNull();
  });

  it("maps returned nodes and total count into a CatalogListResultDto", async () => {
    const node = new neo4j.Node(neo4j.int(1), ["Agent"], { id: "a1", name: "Triage Agent" }, "4:db:1");
    const { graph } = fakeGraphService([node], 1);
    const service = new CatalogService(graph);

    const result = await service.list("Agent", { limit: 25, offset: 0, search: undefined });

    expect(result).toEqual({
      items: [{ id: "4:db:1", label: "Agent", properties: { id: "a1", name: "Triage Agent" } }],
      total: 1,
      limit: 25,
      offset: 0,
    });
  });
});

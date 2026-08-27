import { describe, expect, it } from "vitest";
import neo4j from "neo4j-driver";
import { pathsToGraphResult, toGraphEdgeDto, toGraphNodeDto, unwrapValue } from "./mapping";

function makeNode(labels: string[], properties: Record<string, unknown>, elementId: string) {
  return new neo4j.Node(neo4j.int(1), labels, properties, elementId);
}

function makeRelationship(
  type: string,
  properties: Record<string, unknown>,
  elementId: string,
  startElementId: string,
  endElementId: string,
) {
  return new neo4j.Relationship(
    neo4j.int(1),
    neo4j.int(1),
    neo4j.int(2),
    type,
    properties,
    elementId,
    startElementId,
    endElementId,
  );
}

describe("unwrapValue", () => {
  it("converts a safe-range Neo4j Integer to a plain number", () => {
    expect(unwrapValue(neo4j.int(42))).toBe(42);
  });

  it("falls back to a string for an Integer outside the safe range", () => {
    const huge = neo4j.int("9007199254740993"); // 2^53 + 1
    expect(unwrapValue(huge)).toBe("9007199254740993");
  });

  it("passes plain primitives through unchanged", () => {
    expect(unwrapValue("hello")).toBe("hello");
    expect(unwrapValue(null)).toBeNull();
    expect(unwrapValue(undefined)).toBeUndefined();
    expect(unwrapValue(true)).toBe(true);
  });

  it("recursively unwraps arrays and nested objects", () => {
    expect(unwrapValue([neo4j.int(1), neo4j.int(2)])).toEqual([1, 2]);
    expect(unwrapValue({ a: neo4j.int(5), b: { c: neo4j.int(6) } })).toEqual({ a: 5, b: { c: 6 } });
  });
});

describe("toGraphNodeDto", () => {
  it("maps label, elementId, and unwrapped properties", () => {
    const node = makeNode(["Agent"], { id: "abc-123", name: "Triage Agent", createdAt: neo4j.int(0) }, "4:db:1");
    const dto = toGraphNodeDto(node);

    expect(dto).toEqual({
      id: "4:db:1",
      label: "Agent",
      properties: { id: "abc-123", name: "Triage Agent", createdAt: 0 },
    });
  });
});

describe("toGraphEdgeDto", () => {
  it("maps type, endpoints, and unwrapped properties", () => {
    const rel = makeRelationship("USES_TOOL", { criticality: "core" }, "5:db:1", "4:db:1", "4:db:2");
    const dto = toGraphEdgeDto(rel);

    expect(dto).toEqual({
      id: "5:db:1",
      type: "USES_TOOL",
      source: "4:db:1",
      target: "4:db:2",
      properties: { criticality: "core" },
    });
  });
});

describe("pathsToGraphResult", () => {
  it("flattens a single-hop path into one edge and two nodes", () => {
    const agent = makeNode(["Agent"], { id: "a1", name: "Agent" }, "4:db:1");
    const tool = makeNode(["Tool"], { id: "t1", name: "Tool" }, "4:db:2");
    const rel = makeRelationship("USES_TOOL", {}, "5:db:1", "4:db:1", "4:db:2");
    const path = new neo4j.Path(agent, tool, [new neo4j.PathSegment(agent, rel, tool)]);

    const result = pathsToGraphResult([path]);

    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
    expect(result.nodes.map((n) => n.id).sort()).toEqual(["4:db:1", "4:db:2"]);
    expect(result.edges[0]).toMatchObject({ source: "4:db:1", target: "4:db:2", type: "USES_TOOL" });
  });

  it("deduplicates nodes and edges shared across multiple paths", () => {
    const agent = makeNode(["Agent"], { id: "a1", name: "Agent" }, "4:db:1");
    const tool = makeNode(["Tool"], { id: "t1", name: "Tool" }, "4:db:2");
    const workflow = makeNode(["Workflow"], { id: "w1", name: "Workflow" }, "4:db:3");
    const relToTool = makeRelationship("USES_TOOL", {}, "5:db:1", "4:db:1", "4:db:2");
    const relToWorkflow = makeRelationship("EXECUTES", {}, "5:db:2", "4:db:1", "4:db:3");

    const pathA = new neo4j.Path(agent, tool, [new neo4j.PathSegment(agent, relToTool, tool)]);
    const pathB = new neo4j.Path(agent, workflow, [new neo4j.PathSegment(agent, relToWorkflow, workflow)]);

    const result = pathsToGraphResult([pathA, pathB]);

    // agent appears in both paths but should only be counted once
    expect(result.nodes).toHaveLength(3);
    expect(result.edges).toHaveLength(2);
  });

  it("returns empty node/edge lists for no paths", () => {
    expect(pathsToGraphResult([])).toEqual({ nodes: [], edges: [] });
  });
});

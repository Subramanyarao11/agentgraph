import neo4j, { type Node as Neo4jNode, type Relationship } from "neo4j-driver";
import type { GraphEdgeDto, GraphNodeDto, NodeLabel, RelType } from "@agentgraph/graph-schema";

/**
 * Bolt returns Neo4j Integers (safe past 2^53) and temporal types that
 * aren't plain JS values. Recursively unwrap them so every value that
 * reaches a controller/JSON response is a plain, serializable primitive.
 */
export function unwrapValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (neo4j.isInt(value)) {
    return value.inSafeRange() ? value.toNumber() : value.toString();
  }
  if (
    neo4j.temporal.isDateTime(value) ||
    neo4j.temporal.isDate(value) ||
    neo4j.temporal.isLocalDateTime(value)
  ) {
    return value.toString();
  }
  if (Array.isArray(value)) return value.map(unwrapValue);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, unwrapValue(v)]),
    );
  }
  return value;
}

function unwrapProperties(props: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(props).map(([k, v]) => [k, unwrapValue(v)]));
}

export function toGraphNodeDto(node: Neo4jNode): GraphNodeDto {
  const label = (node.labels[0] ?? "Unknown") as NodeLabel;
  return {
    id: node.elementId,
    label,
    properties: unwrapProperties(node.properties),
  };
}

export function toGraphEdgeDto(rel: Relationship): GraphEdgeDto {
  return {
    id: rel.elementId,
    type: rel.type as RelType,
    source: rel.startNodeElementId,
    target: rel.endNodeElementId,
    properties: unwrapProperties(rel.properties),
  };
}

export function isNeo4jNode(value: unknown): value is Neo4jNode {
  return neo4j.isNode(value);
}

export function isNeo4jRelationship(value: unknown): value is Relationship {
  return neo4j.isRelationship(value);
}

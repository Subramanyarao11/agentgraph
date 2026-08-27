import neo4j, { type Integer } from "neo4j-driver";

/**
 * Wrap a JS number destined for an INTEGER-typed Cypher position (SKIP,
 * LIMIT, or any property stored as an int) before passing it as a query
 * parameter. The driver serializes a plain `number` as a Bolt Float, and
 * Neo4j's SKIP/LIMIT reject floats outright (`'2.0' is not a valid value`) —
 * this is not optional for those two clauses.
 */
export function cypherInt(value: number): Integer {
  return neo4j.int(value);
}

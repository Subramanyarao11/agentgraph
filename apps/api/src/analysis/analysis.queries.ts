/**
 * The Cypher for every "interesting" graph query in the app, kept in one
 * place so they're easy to read and explain independent of the service
 * plumbing around them.
 *
 * A note on `maxHops`: Cypher does not support parameterizing the bounds of
 * a variable-length relationship pattern (`*1..N` must be literal integers —
 * this is a documented Neo4j/openCypher limitation, not a stylistic choice).
 * Every value interpolated below is first validated by Zod as an integer in
 * [1, 6] (see ImpactAnalysisQuery/LineageQuery in @agentgraph/graph-schema)
 * before it reaches these functions, so this is safe range-checked
 * interpolation, not string-concatenated user input. Every actual data
 * value (ids, sensitivity, search terms, limits) goes through `$params`.
 */

const IMPACT_RELS = "USES_TOOL|EXECUTES|HAS_STEP|CALLS_TOOL|DEPENDS_ON|NEXT";
const EXPOSURE_RELS = "USES_TOOL|EXECUTES|HAS_STEP|CALLS_TOOL|READS_FROM|WRITES_TO";

/** Blast radius: every Agent/Workflow within N hops of a failing node (Tool, Workflow, ...). */
export function impactListQuery(maxHops: number): string {
  return `
    MATCH (start {id: $nodeId})
    MATCH path = (start)-[:${IMPACT_RELS}*1..${maxHops}]-(affected)
    WHERE (affected:Agent OR affected:Workflow) AND affected.id <> $nodeId
    WITH affected, min(length(path)) AS hops
    RETURN affected, hops
    ORDER BY hops ASC, affected.name ASC
  `;
}

/** Same traversal, returning shortest paths for visualization instead of a flat list. */
export function impactPathsQuery(maxHops: number): string {
  return `
    MATCH (start {id: $nodeId})
    MATCH path = shortestPath((start)-[:${IMPACT_RELS}*1..${maxHops}]-(affected))
    WHERE (affected:Agent OR affected:Workflow) AND affected.id <> $nodeId
    RETURN path
  `;
}

/**
 * Data lineage: fixed 4-hop traversal from a Dataset back to every Agent
 * that can produce/consume it, through the Tool/Step/Workflow chain. This
 * is the kind of query a relational schema makes painful — it's four joins
 * across tables shaped differently per hop (agents, workflows, steps,
 * tools), or a recursive CTE if step order is dynamic; here it's one
 * pattern match.
 */
export const LINEAGE_PATH_QUERY = `
  MATCH path = (d:Dataset {id: $datasetId})<-[:READS_FROM|WRITES_TO]-(:Tool)
               <-[:CALLS_TOOL]-(:Step)<-[:HAS_STEP]-(:Workflow)<-[:EXECUTES]-(:Agent)
  RETURN path
  LIMIT 100
`;

/**
 * Agent similarity by shared tool usage (a Jaccard-style recommendation).
 * Awkward in SQL: it's a self-join through a many-to-many bridge table
 * with a GROUP BY and a per-row normalization against the source agent's
 * own tool count — natural here as one pattern + aggregation.
 */
export const SIMILAR_AGENTS_QUERY = `
  MATCH (a:Agent {id: $agentId})-[:USES_TOOL]->(t:Tool)
  WITH a, collect(DISTINCT t) AS aTools, count(DISTINCT t) AS aToolCount
  MATCH (other:Agent)-[:USES_TOOL]->(t2:Tool)
  WHERE other.id <> a.id AND t2 IN aTools
  WITH other, aToolCount, collect(DISTINCT t2.name) AS sharedToolNames, count(DISTINCT t2) AS sharedTools
  RETURN other, sharedToolNames, sharedTools, toFloat(sharedTools) / aToolCount AS score
  ORDER BY score DESC, sharedTools DESC
  LIMIT $limit
`;

/**
 * Sensitive-data exposure: every Agent that can transitively reach a
 * Dataset of a given sensitivity, with the shortest path between them.
 * Governance question ("who can touch PII, however indirectly") that's a
 * multi-hop reachability problem — exactly what a graph database is for.
 */
export function exposureQuery(maxHops: number): string {
  return `
    MATCH (a:Agent), (d:Dataset {sensitivity: $sensitivity})
    MATCH path = shortestPath((a)-[:${EXPOSURE_RELS}*1..${maxHops}]-(d))
    RETURN a, d, length(path) AS hops, path
    ORDER BY hops ASC
    LIMIT 200
  `;
}

/** Full provenance of one execution: which workflow ran, which agent triggered it, which datasets it touched. */
export const EXECUTION_TRACE_QUERY = `
  MATCH (e:Execution {id: $executionId})
  MATCH (e)-[:RAN]->(w:Workflow)
  MATCH (e)-[:TRIGGERED_BY]->(a:Agent)
  OPTIONAL MATCH (e)-[t:TOUCHED]->(d:Dataset)
  RETURN e, w, a, collect(DISTINCT {dataset: d, access: t.access}) AS touched
`;

/** All-pairs agent similarity across the whole graph — the expensive O(n^2) version run as a background job. */
export const SIMILARITY_LEADERBOARD_QUERY = `
  MATCH (a:Agent)-[:USES_TOOL]->(t:Tool)<-[:USES_TOOL]-(b:Agent)
  WHERE a.id < b.id
  WITH a, b, count(DISTINCT t) AS sharedTools
  WHERE sharedTools >= 2
  RETURN a, b, sharedTools
  ORDER BY sharedTools DESC
  LIMIT 50
`;

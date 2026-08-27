import type { GraphClient } from "./client";

/**
 * Uniqueness constraints (which also create backing indexes) for every
 * node label's `id`, plus a couple of lookup indexes on properties the
 * analysis queries filter on heavily. Idempotent — safe to run on every
 * boot and against an already-provisioned CognoDB instance.
 */
const CONSTRAINTS: string[] = [
  "CREATE CONSTRAINT person_id IF NOT EXISTS FOR (n:Person) REQUIRE n.id IS UNIQUE",
  "CREATE CONSTRAINT agent_id IF NOT EXISTS FOR (n:Agent) REQUIRE n.id IS UNIQUE",
  "CREATE CONSTRAINT tool_id IF NOT EXISTS FOR (n:Tool) REQUIRE n.id IS UNIQUE",
  "CREATE CONSTRAINT workflow_id IF NOT EXISTS FOR (n:Workflow) REQUIRE n.id IS UNIQUE",
  "CREATE CONSTRAINT step_id IF NOT EXISTS FOR (n:Step) REQUIRE n.id IS UNIQUE",
  "CREATE CONSTRAINT dataset_id IF NOT EXISTS FOR (n:Dataset) REQUIRE n.id IS UNIQUE",
  "CREATE CONSTRAINT execution_id IF NOT EXISTS FOR (n:Execution) REQUIRE n.id IS UNIQUE",
];

const INDEXES: string[] = [
  "CREATE INDEX dataset_sensitivity IF NOT EXISTS FOR (n:Dataset) ON (n.sensitivity)",
  "CREATE INDEX tool_category IF NOT EXISTS FOR (n:Tool) ON (n.category)",
  "CREATE INDEX agent_status IF NOT EXISTS FOR (n:Agent) ON (n.status)",
  "CREATE INDEX execution_status IF NOT EXISTS FOR (n:Execution) ON (n.status)",
];

export interface ApplyGraphSchemaResult {
  applied: string[];
  failed: Array<{ statement: string; message: string }>;
}

/**
 * Applies each constraint/index statement independently and keeps going on
 * failure. `CREATE CONSTRAINT ... FOR ... REQUIRE ... IS UNIQUE` is Neo4j's
 * DDL syntax, not part of openCypher proper — CognoDB documents Bolt/Cypher
 * query compatibility but doesn't document DDL support, so this can't be
 * assumed. If it's unsupported the app still works correctly (constraints
 * only add uniqueness enforcement + index-backed lookups, which the demo's
 * small dataset doesn't depend on for correctness) — callers should log
 * `result.failed` as a warning, never treat it as fatal.
 */
export async function applyGraphSchema(client: GraphClient): Promise<ApplyGraphSchemaResult> {
  const applied: string[] = [];
  const failed: ApplyGraphSchemaResult["failed"] = [];

  for (const statement of [...CONSTRAINTS, ...INDEXES]) {
    try {
      await client.writeQuery(statement);
      applied.push(statement);
    } catch (err) {
      failed.push({ statement, message: err instanceof Error ? err.message : String(err) });
    }
  }

  return { applied, failed };
}

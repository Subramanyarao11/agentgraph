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

export async function applyGraphSchema(client: GraphClient): Promise<void> {
  for (const statement of [...CONSTRAINTS, ...INDEXES]) {
    await client.writeQuery(statement);
  }
}

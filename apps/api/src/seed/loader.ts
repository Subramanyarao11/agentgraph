import type { GraphClient } from "@agentgraph/graph-client";
import { NodeLabel, RelType, type NodeLabel as NodeLabelType, type RelType as RelTypeType } from "@agentgraph/graph-schema";
import type { SeedData } from "./generators";

const CHUNK_SIZE = 200;

function chunk<T>(rows: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

/** Batched `UNWIND ... CREATE` for a node label. All property values come through `$rows` — no interpolation. */
async function createNodes<T extends Record<string, unknown>>(
  client: GraphClient,
  label: NodeLabelType,
  rows: T[],
): Promise<void> {
  for (const batch of chunk(rows, CHUNK_SIZE)) {
    await client.writeQuery(`UNWIND $rows AS row CREATE (n:${label}) SET n = row`, { rows: batch });
  }
}

interface RelRow {
  fromId: string;
  toId: string;
  props?: Record<string, unknown>;
}

/** Batched `UNWIND ... MATCH ... CREATE` for a relationship type between two already-created node labels. */
async function createRelationships(
  client: GraphClient,
  fromLabel: NodeLabelType,
  toLabel: NodeLabelType,
  relType: RelTypeType,
  rows: RelRow[],
): Promise<void> {
  for (const batch of chunk(rows, CHUNK_SIZE)) {
    await client.writeQuery(
      `UNWIND $rows AS row
       MATCH (a:${fromLabel} {id: row.fromId})
       MATCH (b:${toLabel} {id: row.toId})
       CREATE (a)-[r:${relType}]->(b)
       SET r = row.props`,
      { rows: batch.map((r) => ({ fromId: r.fromId, toId: r.toId, props: r.props ?? {} })) },
    );
  }
}

export async function loadSeedData(client: GraphClient, data: SeedData): Promise<void> {
  await createNodes(client, NodeLabel.Person, data.people);
  await createNodes(client, NodeLabel.Tool, data.tools);
  await createNodes(client, NodeLabel.Dataset, data.datasets);
  await createNodes(client, NodeLabel.Agent, data.agents);
  await createNodes(client, NodeLabel.Workflow, data.workflows);
  await createNodes(client, NodeLabel.Step, data.steps);
  await createNodes(client, NodeLabel.Execution, data.executions);

  await createRelationships(
    client,
    NodeLabel.Person,
    NodeLabel.Agent,
    RelType.OWNS,
    data.personOwnsAgent.map((r) => ({ fromId: r.personId, toId: r.agentId })),
  );
  await createRelationships(
    client,
    NodeLabel.Person,
    NodeLabel.Workflow,
    RelType.OWNS,
    data.personOwnsWorkflow.map((r) => ({ fromId: r.personId, toId: r.workflowId })),
  );
  await createRelationships(
    client,
    NodeLabel.Agent,
    NodeLabel.Tool,
    RelType.USES_TOOL,
    data.agentUsesTool.map((r) => ({
      fromId: r.agentId,
      toId: r.toolId,
      props: { criticality: r.criticality, since: r.since },
    })),
  );
  await createRelationships(
    client,
    NodeLabel.Agent,
    NodeLabel.Workflow,
    RelType.EXECUTES,
    data.agentExecutesWorkflow.map((r) => ({ fromId: r.agentId, toId: r.workflowId, props: { role: r.role } })),
  );
  await createRelationships(
    client,
    NodeLabel.Workflow,
    NodeLabel.Step,
    RelType.HAS_STEP,
    data.workflowHasStep.map((r) => ({ fromId: r.workflowId, toId: r.stepId, props: { order: r.order } })),
  );
  await createRelationships(
    client,
    NodeLabel.Step,
    NodeLabel.Step,
    RelType.NEXT,
    data.stepNext.map((r) => ({ fromId: r.fromStepId, toId: r.toStepId, props: { condition: r.condition } })),
  );
  await createRelationships(
    client,
    NodeLabel.Step,
    NodeLabel.Tool,
    RelType.CALLS_TOOL,
    data.stepCallsTool.map((r) => ({ fromId: r.stepId, toId: r.toolId })),
  );
  await createRelationships(
    client,
    NodeLabel.Tool,
    NodeLabel.Dataset,
    RelType.READS_FROM,
    data.toolDatasetLinks.filter((l) => l.access === "read").map((r) => ({ fromId: r.toolId, toId: r.datasetId })),
  );
  await createRelationships(
    client,
    NodeLabel.Tool,
    NodeLabel.Dataset,
    RelType.WRITES_TO,
    data.toolDatasetLinks.filter((l) => l.access === "write").map((r) => ({ fromId: r.toolId, toId: r.datasetId })),
  );
  await createRelationships(
    client,
    NodeLabel.Workflow,
    NodeLabel.Workflow,
    RelType.DEPENDS_ON,
    data.workflowDependsOn.map((r) => ({ fromId: r.workflowId, toId: r.dependsOnWorkflowId })),
  );
  await createRelationships(
    client,
    NodeLabel.Execution,
    NodeLabel.Workflow,
    RelType.RAN,
    data.executionRan.map((r) => ({ fromId: r.executionId, toId: r.workflowId })),
  );
  await createRelationships(
    client,
    NodeLabel.Execution,
    NodeLabel.Agent,
    RelType.TRIGGERED_BY,
    data.executionTriggeredBy.map((r) => ({ fromId: r.executionId, toId: r.agentId })),
  );
  await createRelationships(
    client,
    NodeLabel.Execution,
    NodeLabel.Dataset,
    RelType.TOUCHED,
    data.executionTouched.map((r) => ({ fromId: r.executionId, toId: r.datasetId, props: { access: r.access } })),
  );
}

export async function resetGraph(client: GraphClient): Promise<void> {
  // Delete in batches so a large existing graph doesn't blow past a single transaction's memory.
  // No initializer: the loop body always runs at least once (do-while) and assigns `deleted`
  // before the condition ever reads it, so an initial value here would be genuinely dead.
  let deleted: number;
  do {
    const result = await client.writeQuery("MATCH (n) WITH n LIMIT 1000 DETACH DELETE n RETURN count(n) AS deleted");
    deleted = Number(result.records[0]?.get("deleted") ?? 0);
  } while (deleted > 0);
}

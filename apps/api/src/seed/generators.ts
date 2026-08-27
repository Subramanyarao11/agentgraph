import { randomUUID } from "node:crypto";
import { faker } from "@faker-js/faker";
import type {
  AgentProps,
  DatasetProps,
  ExecutionProps,
  PersonProps,
  StepProps,
  ToolProps,
  WorkflowProps,
} from "@agentgraph/graph-schema";
import { AGENT_ROLES, DATASET_CATALOG, TOOL_CATALOG, TOOL_DATASET_LINKS, type DataAccess } from "./catalog-data";

faker.seed(42); // deterministic seed data across runs

const TEAMS = ["Support", "Sales", "Finance", "Platform", "People", "Marketing", "Security", "Engineering"];
const REGIONAL_VARIANTS = ["EMEA", "APAC", "LATAM", "Enterprise", "SMB"];

export interface SeedData {
  people: PersonProps[];
  tools: ToolProps[];
  datasets: DatasetProps[];
  agents: AgentProps[];
  workflows: WorkflowProps[];
  steps: StepProps[];
  executions: ExecutionProps[];

  toolDatasetLinks: Array<{ toolId: string; datasetId: string; access: DataAccess }>;
  personOwnsAgent: Array<{ personId: string; agentId: string }>;
  personOwnsWorkflow: Array<{ personId: string; workflowId: string }>;
  agentUsesTool: Array<{ agentId: string; toolId: string; criticality: "core" | "optional"; since: string }>;
  agentExecutesWorkflow: Array<{ agentId: string; workflowId: string; role: "primary" | "fallback" }>;
  workflowHasStep: Array<{ workflowId: string; stepId: string; order: number }>;
  stepNext: Array<{ fromStepId: string; toStepId: string; condition: string | null }>;
  stepCallsTool: Array<{ stepId: string; toolId: string }>;
  workflowDependsOn: Array<{ workflowId: string; dependsOnWorkflowId: string }>;
  executionRan: Array<{ executionId: string; workflowId: string }>;
  executionTriggeredBy: Array<{ executionId: string; agentId: string }>;
  executionTouched: Array<{ executionId: string; datasetId: string; access: DataAccess }>;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function pickN<T>(arr: T[], n: number): T[] {
  return faker.helpers.arrayElements(arr, Math.min(n, arr.length));
}

export function generateSeedData(): SeedData {
  // ---- People ----
  const people: PersonProps[] = Array.from({ length: 22 }, () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      id: randomUUID(),
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      team: faker.helpers.arrayElement(TEAMS),
      title: faker.person.jobTitle(),
      createdAt: isoDaysAgo(faker.number.int({ min: 90, max: 700 })),
    };
  });

  // ---- Tools (fixed catalog) ----
  const tools: ToolProps[] = TOOL_CATALOG.map((t) => ({
    id: randomUUID(),
    name: t.name,
    vendor: t.vendor,
    category: t.category,
    authType: t.authType,
    riskLevel: t.riskLevel,
    createdAt: isoDaysAgo(faker.number.int({ min: 200, max: 900 })),
  }));
  const toolIdByName = new Map(tools.map((t) => [t.name, t.id]));

  // ---- Datasets (fixed catalog) ----
  const datasets: DatasetProps[] = DATASET_CATALOG.map((d) => ({
    id: randomUUID(),
    name: d.name,
    system: d.system,
    sensitivity: d.sensitivity,
  }));
  const datasetIdByName = new Map(datasets.map((d) => [d.name, d.id]));

  const toolDatasetLinks = TOOL_DATASET_LINKS.map((link) => ({
    toolId: toolIdByName.get(link.tool)!,
    datasetId: datasetIdByName.get(link.dataset)!,
    access: link.access,
  }));

  // ---- Agents: one per role, plus a handful of regional duplicates ----
  const agents: AgentProps[] = [];
  const agentRoleIndex = new Map<string, (typeof AGENT_ROLES)[number]>();
  for (const roleSeed of AGENT_ROLES) {
    const id = randomUUID();
    agents.push({
      id,
      name: `${roleSeed.role} Agent`,
      role: roleSeed.role,
      description: roleSeed.description,
      status: faker.helpers.weightedArrayElement([
        { value: "active", weight: 8 },
        { value: "paused", weight: 1 },
        { value: "deprecated", weight: 1 },
      ]),
      autonomyLevel: faker.helpers.weightedArrayElement([
        { value: "supervised", weight: 6 },
        { value: "autonomous", weight: 4 },
      ]),
      createdAt: isoDaysAgo(faker.number.int({ min: 10, max: 500 })),
    });
    agentRoleIndex.set(id, roleSeed);
  }
  for (const roleSeed of pickN(AGENT_ROLES, 10)) {
    const id = randomUUID();
    const region = faker.helpers.arrayElement(REGIONAL_VARIANTS);
    agents.push({
      id,
      name: `${roleSeed.role} Agent — ${region}`,
      role: roleSeed.role,
      description: roleSeed.description,
      status: faker.helpers.weightedArrayElement([
        { value: "active", weight: 8 },
        { value: "paused", weight: 1 },
        { value: "deprecated", weight: 1 },
      ]),
      autonomyLevel: faker.helpers.weightedArrayElement([
        { value: "supervised", weight: 6 },
        { value: "autonomous", weight: 4 },
      ]),
      createdAt: isoDaysAgo(faker.number.int({ min: 10, max: 500 })),
    });
    agentRoleIndex.set(id, roleSeed);
  }

  const personOwnsAgent = agents.map((a) => ({
    personId: faker.helpers.arrayElement(people).id,
    agentId: a.id,
  }));

  const agentUsesTool: SeedData["agentUsesTool"] = [];
  for (const agent of agents) {
    const roleSeed = agentRoleIndex.get(agent.id)!;
    const preferred = roleSeed.preferredTools.map((name) => toolIdByName.get(name)!).filter(Boolean);
    const extra = pickN(
      tools.map((t) => t.id).filter((id) => !preferred.includes(id)),
      faker.number.int({ min: 0, max: 2 }),
    );
    for (const toolId of preferred) {
      agentUsesTool.push({
        agentId: agent.id,
        toolId,
        criticality: "core",
        since: isoDaysAgo(faker.number.int({ min: 5, max: 400 })),
      });
    }
    for (const toolId of extra) {
      agentUsesTool.push({
        agentId: agent.id,
        toolId,
        criticality: "optional",
        since: isoDaysAgo(faker.number.int({ min: 5, max: 400 })),
      });
    }
  }

  // ---- Workflows: one primary flow per agent, some agents get a second ----
  const workflows: WorkflowProps[] = [];
  const workflowOwnerAgent = new Map<string, AgentProps>();
  for (const agent of agents) {
    const roleSeed = agentRoleIndex.get(agent.id)!;
    const count = faker.number.int({ min: 1, max: 2 });
    for (let i = 0; i < count; i++) {
      const id = randomUUID();
      const suffix = i === 0 ? "" : ` (${faker.helpers.arrayElement(["Escalation Path", "Batch Mode", "Manual Trigger"])})`;
      workflows.push({
        id,
        name: `${roleSeed.role}${suffix}`,
        description: `${roleSeed.description} Triggered ${faker.helpers.arrayElement([
          "on a schedule",
          "when a new event arrives",
          "on manual request",
        ])}.`,
        trigger: faker.helpers.arrayElement(["schedule", "event", "manual"]),
        status: faker.helpers.weightedArrayElement([
          { value: "active", weight: 7 },
          { value: "draft", weight: 2 },
          { value: "archived", weight: 1 },
        ]),
        createdAt: isoDaysAgo(faker.number.int({ min: 5, max: 450 })),
      });
      workflowOwnerAgent.set(id, agent);
    }
  }

  const personOwnsWorkflow = workflows.map((w) => ({
    personId: faker.helpers.arrayElement(people).id,
    workflowId: w.id,
  }));

  const agentExecutesWorkflow: SeedData["agentExecutesWorkflow"] = workflows.map((w) => ({
    agentId: workflowOwnerAgent.get(w.id)!.id,
    workflowId: w.id,
    role: "primary",
  }));
  // A handful of workflows also have a fallback agent from the same role pool.
  for (const w of pickN(workflows, Math.floor(workflows.length / 4))) {
    const primary = workflowOwnerAgent.get(w.id)!;
    const roleSeed = agentRoleIndex.get(primary.id)!;
    const sameRoleAgents = agents.filter((a) => agentRoleIndex.get(a.id) === roleSeed && a.id !== primary.id);
    if (sameRoleAgents.length > 0) {
      agentExecutesWorkflow.push({
        agentId: faker.helpers.arrayElement(sameRoleAgents).id,
        workflowId: w.id,
        role: "fallback",
      });
    }
  }

  // A few workflows depend on an earlier-created workflow (acyclic: only depend backwards).
  const workflowDependsOn: SeedData["workflowDependsOn"] = [];
  workflows.forEach((w, idx) => {
    if (idx > 3 && faker.datatype.boolean({ probability: 0.2 })) {
      const candidate = workflows[faker.number.int({ min: 0, max: idx - 1 })];
      if (candidate && candidate.id !== w.id) {
        workflowDependsOn.push({ workflowId: w.id, dependsOnWorkflowId: candidate.id });
      }
    }
  });

  // ---- Steps: a linear chain of 3-6 steps per workflow, each calling one of the owning agent's tools ----
  const steps: StepProps[] = [];
  const workflowHasStep: SeedData["workflowHasStep"] = [];
  const stepNext: SeedData["stepNext"] = [];
  const stepCallsTool: SeedData["stepCallsTool"] = [];
  const STEP_VERBS = ["Fetch", "Classify", "Enrich", "Validate", "Notify", "Update", "Summarize", "Escalate"];

  for (const w of workflows) {
    const owner = workflowOwnerAgent.get(w.id)!;
    const roleSeed = agentRoleIndex.get(owner.id)!;
    const toolIds = roleSeed.preferredTools.map((name) => toolIdByName.get(name)!).filter(Boolean);
    const stepCount = faker.number.int({ min: 3, max: 6 });
    let previousStepId: string | null = null;

    for (let order = 0; order < stepCount; order++) {
      const id = randomUUID();
      const isLast = order === stepCount - 1;
      const type = isLast
        ? faker.helpers.arrayElement(["action", "approval"] as const)
        : faker.helpers.arrayElement(["action", "action", "condition", "loop"] as const);
      const verb = STEP_VERBS[order % STEP_VERBS.length];

      steps.push({ id, name: `${verb} ${faker.word.noun()}`, type, order });
      workflowHasStep.push({ workflowId: w.id, stepId: id, order });

      if (previousStepId) {
        stepNext.push({
          fromStepId: previousStepId,
          toStepId: id,
          condition: type === "condition" ? faker.helpers.arrayElement(["on success", "on failure", null]) : null,
        });
      }
      previousStepId = id;

      if (type === "action" || type === "approval") {
        const toolId = toolIds.length > 0 ? faker.helpers.arrayElement(toolIds) : faker.helpers.arrayElement(tools).id;
        stepCallsTool.push({ stepId: id, toolId });
      }
    }
  }

  // ---- Executions: recent runs of active workflows ----
  const executions: ExecutionProps[] = [];
  const executionRan: SeedData["executionRan"] = [];
  const executionTriggeredBy: SeedData["executionTriggeredBy"] = [];
  const executionTouched: SeedData["executionTouched"] = [];

  const activeWorkflows = workflows.filter((w) => w.status === "active");
  for (let i = 0; i < 260; i++) {
    const workflow = faker.helpers.arrayElement(activeWorkflows.length > 0 ? activeWorkflows : workflows);
    const agent = workflowOwnerAgent.get(workflow.id)!;
    const startedDaysAgo = faker.number.int({ min: 0, max: 60 });
    const startedAt = isoDaysAgo(startedDaysAgo);
    const status = faker.helpers.weightedArrayElement([
      { value: "success", weight: 8 },
      { value: "failed", weight: 1 },
      { value: "running", weight: 1 },
    ] as const);
    const durationMs = status === "running" ? null : faker.number.int({ min: 400, max: 45_000 });
    const finishedAt =
      status === "running"
        ? null
        : new Date(new Date(startedAt).getTime() + (durationMs ?? 0)).toISOString();

    const id = randomUUID();
    executions.push({ id, status, startedAt, finishedAt, durationMs });
    executionRan.push({ executionId: id, workflowId: workflow.id });
    executionTriggeredBy.push({ executionId: id, agentId: agent.id });

    const relatedDatasets = toolDatasetLinks.filter((l) =>
      stepCallsTool.some((sc) => sc.toolId === l.toolId && workflowHasStep.some((ws) => ws.workflowId === workflow.id && ws.stepId === sc.stepId)),
    );
    for (const link of pickN(relatedDatasets, faker.number.int({ min: 0, max: 2 }))) {
      executionTouched.push({ executionId: id, datasetId: link.datasetId, access: link.access });
    }
  }

  return {
    people,
    tools,
    datasets,
    agents,
    workflows,
    steps,
    executions,
    toolDatasetLinks,
    personOwnsAgent,
    personOwnsWorkflow,
    agentUsesTool,
    agentExecutesWorkflow,
    workflowHasStep,
    stepNext,
    stepCallsTool,
    workflowDependsOn,
    executionRan,
    executionTriggeredBy,
    executionTouched,
  };
}

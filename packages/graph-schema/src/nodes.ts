import { z } from "zod";

/**
 * Zod schemas for every node label in the graph. Each `*Props` schema is the
 * exact property bag stored on the Cypher node (primitives only — Bolt does
 * not support nested objects/arrays of objects as node properties).
 */

const isoDateTime = z.string().datetime();

export const PersonProps = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  email: z.string().email(),
  team: z.string().min(1).max(80),
  title: z.string().min(1).max(120),
  createdAt: isoDateTime,
});
export type PersonProps = z.infer<typeof PersonProps>;

export const AgentStatus = z.enum(["active", "paused", "deprecated"]);
export type AgentStatus = z.infer<typeof AgentStatus>;

export const AutonomyLevel = z.enum(["supervised", "autonomous"]);
export type AutonomyLevel = z.infer<typeof AutonomyLevel>;

export const AgentProps = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  role: z.string().min(1).max(120),
  description: z.string().max(2000),
  status: AgentStatus,
  autonomyLevel: AutonomyLevel,
  createdAt: isoDateTime,
});
export type AgentProps = z.infer<typeof AgentProps>;

export const ToolCategory = z.enum([
  "communication",
  "project_management",
  "crm",
  "storage",
  "finance",
  "identity",
  "analytics",
  "custom_api",
]);
export type ToolCategory = z.infer<typeof ToolCategory>;

export const ToolAuthType = z.enum(["oauth2", "api_key", "service_account"]);
export type ToolAuthType = z.infer<typeof ToolAuthType>;

export const RiskLevel = z.enum(["low", "medium", "high"]);
export type RiskLevel = z.infer<typeof RiskLevel>;

export const ToolProps = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  vendor: z.string().min(1).max(120),
  category: ToolCategory,
  authType: ToolAuthType,
  riskLevel: RiskLevel,
  createdAt: isoDateTime,
});
export type ToolProps = z.infer<typeof ToolProps>;

export const WorkflowTrigger = z.enum(["schedule", "event", "manual"]);
export type WorkflowTrigger = z.infer<typeof WorkflowTrigger>;

export const WorkflowStatus = z.enum(["active", "draft", "archived"]);
export type WorkflowStatus = z.infer<typeof WorkflowStatus>;

export const WorkflowProps = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(160),
  description: z.string().max(2000),
  trigger: WorkflowTrigger,
  status: WorkflowStatus,
  createdAt: isoDateTime,
});
export type WorkflowProps = z.infer<typeof WorkflowProps>;

export const StepType = z.enum(["action", "condition", "loop", "approval"]);
export type StepType = z.infer<typeof StepType>;

export const StepProps = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(160),
  type: StepType,
  order: z.number().int().nonnegative(),
});
export type StepProps = z.infer<typeof StepProps>;

export const DataSensitivity = z.enum([
  "public",
  "internal",
  "confidential",
  "pii",
]);
export type DataSensitivity = z.infer<typeof DataSensitivity>;

export const DatasetProps = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(160),
  system: z.string().min(1).max(120),
  sensitivity: DataSensitivity,
});
export type DatasetProps = z.infer<typeof DatasetProps>;

export const ExecutionStatus = z.enum(["success", "failed", "running"]);
export type ExecutionStatus = z.infer<typeof ExecutionStatus>;

export const ExecutionProps = z.object({
  id: z.string().uuid(),
  status: ExecutionStatus,
  startedAt: isoDateTime,
  finishedAt: isoDateTime.nullable(),
  durationMs: z.number().int().nonnegative().nullable(),
});
export type ExecutionProps = z.infer<typeof ExecutionProps>;

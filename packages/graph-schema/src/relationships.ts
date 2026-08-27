import { z } from "zod";

/** Zod schemas for relationship property bags. Relationships with no
 * meaningful properties (e.g. HAS_STEP's ordering lives on Step.order) use
 * an empty object schema for symmetry and future-proofing. */

export const Criticality = z.enum(["core", "optional"]);
export type Criticality = z.infer<typeof Criticality>;

export const UsesToolProps = z.object({
  criticality: Criticality,
  since: z.string().datetime(),
});
export type UsesToolProps = z.infer<typeof UsesToolProps>;

export const AgentWorkflowRole = z.enum(["primary", "fallback"]);
export type AgentWorkflowRole = z.infer<typeof AgentWorkflowRole>;

export const ExecutesProps = z.object({
  role: AgentWorkflowRole,
});
export type ExecutesProps = z.infer<typeof ExecutesProps>;

export const NextProps = z.object({
  condition: z.string().max(200).nullable(),
});
export type NextProps = z.infer<typeof NextProps>;

export const DataAccess = z.enum(["read", "write"]);
export type DataAccess = z.infer<typeof DataAccess>;

export const TouchedProps = z.object({
  access: DataAccess,
});
export type TouchedProps = z.infer<typeof TouchedProps>;

export const EmptyProps = z.object({});
export type EmptyProps = z.infer<typeof EmptyProps>;

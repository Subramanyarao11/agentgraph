export const queryKeys = {
  health: ["health"] as const,
  catalogList: (label: string, params: Record<string, unknown>) => ["catalog", label, "list", params] as const,
  catalogDetail: (label: string, id: string) => ["catalog", label, "detail", id] as const,
  impact: (nodeId: string | undefined, maxHops: number) => ["analysis", "impact", nodeId, maxHops] as const,
  lineage: (datasetId: string | undefined) => ["analysis", "lineage", datasetId] as const,
  similarAgents: (agentId: string | undefined, limit: number) =>
    ["analysis", "similar-agents", agentId, limit] as const,
  exposure: (sensitivity: string) => ["analysis", "exposure", sensitivity] as const,
  executionTrace: (id: string | undefined) => ["executions", id, "trace"] as const,
  jobStatus: (jobId: string | undefined) => ["jobs", "similarity-leaderboard", jobId] as const,
  savedViews: ["views"] as const,
};

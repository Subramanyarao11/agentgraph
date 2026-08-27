import { useQuery } from "@tanstack/react-query";
import type { ExposurePathDto, GraphResultDto, SimilarAgentResultDto } from "@agentgraph/graph-schema";
import { api, toQueryString } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ExecutionTrace, ImpactResult } from "@/lib/types";

export function useImpact(nodeId: string | undefined, maxHops: number) {
  return useQuery({
    queryKey: queryKeys.impact(nodeId, maxHops),
    queryFn: () => api.get<ImpactResult>(`/analysis/impact${toQueryString({ nodeId: nodeId!, maxHops })}`),
    enabled: Boolean(nodeId),
  });
}

export function useLineage(datasetId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.lineage(datasetId),
    queryFn: () => api.get<GraphResultDto>(`/analysis/lineage${toQueryString({ datasetId: datasetId! })}`),
    enabled: Boolean(datasetId),
  });
}

export function useSimilarAgents(agentId: string | undefined, limit = 5) {
  return useQuery({
    queryKey: queryKeys.similarAgents(agentId, limit),
    queryFn: () => api.get<SimilarAgentResultDto[]>(`/analysis/similar-agents${toQueryString({ agentId: agentId!, limit })}`),
    enabled: Boolean(agentId),
  });
}

export function useExposure(sensitivity: "confidential" | "pii") {
  return useQuery({
    queryKey: queryKeys.exposure(sensitivity),
    queryFn: () => api.get<ExposurePathDto[]>(`/analysis/exposure${toQueryString({ sensitivity })}`),
  });
}

export function useExecutionTrace(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.executionTrace(id),
    queryFn: () => api.get<ExecutionTrace>(`/analysis/executions/${id}/trace`),
    enabled: Boolean(id),
  });
}

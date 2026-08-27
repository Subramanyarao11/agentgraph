import { queryOptions, useQuery } from "@tanstack/react-query";
import type { ObservabilityLogDto, ObservabilitySummaryDto } from "@agentgraph/graph-schema";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

const POLL_MS = 5_000;

export const observabilitySummaryQueryOptions = queryOptions({
  queryKey: queryKeys.observabilitySummary,
  queryFn: () => api.get<ObservabilitySummaryDto>("/observability/summary"),
});

export const observabilityLogQueryOptions = queryOptions({
  queryKey: queryKeys.observabilityLog,
  queryFn: () => api.get<ObservabilityLogDto>("/observability/log"),
});

export function useObservabilitySummary() {
  return useQuery({ ...observabilitySummaryQueryOptions, refetchInterval: POLL_MS });
}

export function useObservabilityLog() {
  return useQuery({ ...observabilityLogQueryOptions, refetchInterval: POLL_MS });
}

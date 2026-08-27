import { useMutation, useQuery } from "@tanstack/react-query";
import type { JobStatusDto } from "@agentgraph/graph-schema";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export function useEnqueueSimilarityLeaderboard() {
  return useMutation({
    mutationFn: () => api.post<{ jobId: string }>("/jobs/similarity-leaderboard"),
  });
}

export function useJobStatus(jobId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.jobStatus(jobId),
    queryFn: () => api.get<JobStatusDto>(`/jobs/similarity-leaderboard/${jobId}`),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "completed" || status === "failed" ? false : 1500;
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { HealthStatus } from "@/lib/types";

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => api.get<HealthStatus>("/health"),
    refetchInterval: 15_000,
    retry: 1,
  });
}

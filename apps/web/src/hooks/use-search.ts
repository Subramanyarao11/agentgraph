import { useQuery } from "@tanstack/react-query";
import type { SearchResultDto } from "@agentgraph/graph-schema";
import { api, toQueryString } from "@/lib/api-client";

export function useSearch(term: string) {
  return useQuery({
    queryKey: ["search", term],
    queryFn: () => api.get<SearchResultDto[]>(`/search${toQueryString({ q: term })}`),
    enabled: term.trim().length > 0,
    placeholderData: (prev) => prev,
  });
}

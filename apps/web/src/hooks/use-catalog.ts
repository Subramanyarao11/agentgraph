import { queryOptions, useQuery } from "@tanstack/react-query";
import type { CatalogListResultDto, GraphResultDto, NodeLabel } from "@agentgraph/graph-schema";
import { api, toQueryString } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export interface CatalogListParams {
  limit?: number;
  offset?: number;
  search?: string;
  [key: string]: string | number | undefined;
}

/**
 * Split out from useCatalogList so the exact same query config can be handed
 * to queryClient.prefetchQuery() (see Sidebar's onMouseEnter) — prefetching
 * with a query key/fn that doesn't byte-for-byte match what the page itself
 * queries just populates a cache entry nothing ever reads.
 */
export function catalogListQueryOptions(label: NodeLabel, params: CatalogListParams = {}) {
  return queryOptions({
    queryKey: queryKeys.catalogList(label, params),
    queryFn: () => api.get<CatalogListResultDto>(`/catalog/${label}${toQueryString(params)}`),
  });
}

export function useCatalogList(label: NodeLabel, params: CatalogListParams = {}) {
  return useQuery({ ...catalogListQueryOptions(label, params), placeholderData: (prev) => prev });
}

export function useCatalogDetail(label: NodeLabel, id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.catalogDetail(label, id ?? ""),
    queryFn: () => api.get<GraphResultDto>(`/catalog/${label}/${id}`),
    enabled: Boolean(id),
  });
}

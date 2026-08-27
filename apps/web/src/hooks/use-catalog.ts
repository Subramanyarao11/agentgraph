import { useQuery } from "@tanstack/react-query";
import type { CatalogListResultDto, GraphResultDto, NodeLabel } from "@agentgraph/graph-schema";
import { api, toQueryString } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export interface CatalogListParams {
  limit?: number;
  offset?: number;
  search?: string;
  [key: string]: string | number | undefined;
}

export function useCatalogList(label: NodeLabel, params: CatalogListParams = {}) {
  return useQuery({
    queryKey: queryKeys.catalogList(label, params),
    queryFn: () => api.get<CatalogListResultDto>(`/catalog/${label}${toQueryString(params)}`),
    placeholderData: (prev) => prev,
  });
}

export function useCatalogDetail(label: NodeLabel, id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.catalogDetail(label, id ?? ""),
    queryFn: () => api.get<GraphResultDto>(`/catalog/${label}/${id}`),
    enabled: Boolean(id),
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateSavedViewDto, SavedViewDto } from "@agentgraph/graph-schema";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export function useSavedViews() {
  return useQuery({
    queryKey: queryKeys.savedViews,
    queryFn: () => api.get<SavedViewDto[]>("/views"),
  });
}

export function useCreateSavedView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSavedViewDto) => api.post<SavedViewDto>("/views", dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.savedViews }),
  });
}

export function useDeleteSavedView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/views/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.savedViews }),
  });
}

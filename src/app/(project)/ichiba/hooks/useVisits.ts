// biome-ignore assist/source/organizeImports: <none>
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { VisitFormData } from "../lib/schemas";
import { visitsService } from "../lib/services/visits";

export const useVisits = () => {
  return useQuery({
    queryKey: ["visits"],
    queryFn: () => visitsService.getAll(),
  });
};

export const useVisit = (id: string) => {
  return useQuery({
    queryKey: ["visit", id],
    queryFn: () => visitsService.getById(id),
    enabled: !!id,
  });
};

export const useCreateVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VisitFormData) => visitsService.create(data),
    onSuccess: (data) => {
      console.log("Mutation successful, data:", data);
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      // Note: We're NOT calling toast.success here anymore
      // Let the component handle the success message
    },
    onError: (error) => {
      console.error("Mutation error details:", error);
      // Don't throw here, let the mutation return the error
      // The component will handle the error in onError callback
    },
  });
};

export const useUpdateVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VisitFormData> }) => visitsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      queryClient.invalidateQueries({ queryKey: ["visit", variables.id] });
      toast.success("Visit berhasil diperbarui");
    },
    onError: (error) => {
      toast.error("Gagal memperbarui visit");
      console.error(error);
    },
  });
};

export const useDeleteVisit = (options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => visitsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      toast.success("Visit berhasil dihapus");
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error("Gagal menghapus visit");
      console.error(error);
      options?.onError?.(error);
    },
  });
};

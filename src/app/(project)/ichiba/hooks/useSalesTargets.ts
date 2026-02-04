// biome-ignore assist/source/organizeImports: <none>
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { salesTargetsService } from "../lib/services/salesTargets";
import type { SalesTargetFormData } from "../lib/schemas";
import { toast } from "sonner";

export const useSalesTargets = () => {
  return useQuery({
    queryKey: ["sales-targets"],
    queryFn: () => salesTargetsService.getAll(),
  });
};

export const useSalesTarget = (id: string) => {
  return useQuery({
    queryKey: ["sales-target", id],
    queryFn: () => salesTargetsService.getById(id),
    enabled: !!id,
  });
};

export const useCreateSalesTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SalesTargetFormData) => salesTargetsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-targets"] });
      toast.success("SalesTarget berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error("Gagal menambahkan Sales Target. Data mungkin sudah ada.");
      console.error(error);
    },
  });
};

export const useUpdateSalesTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SalesTargetFormData> }) =>
      salesTargetsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales-targets"] });
      queryClient.invalidateQueries({
        queryKey: ["sales-target", variables.id],
      });
      toast.success("SalesTarget berhasil diperbarui");
    },
    onError: (error) => {
      toast.error("Gagal memperbarui sales-targets");
      console.error(error);
    },
  });
};

export const useDeleteSalesTarget = (_options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesTargetsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-targets"] });
      toast.success("SalesTarget berhasil dihapus");
    },
    onError: (error) => {
      toast.error("Gagal menghapus sales-targets");
      console.error(error);
    },
  });
};

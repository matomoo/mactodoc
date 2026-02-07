// biome-ignore assist/source/organizeImports: <none>
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { salesTransactionsService } from "../lib/services/salesTransactions";
import type { SalesTransactionsFormData } from "../lib/schemas";
import { toast } from "sonner";

export const useSalesTransactions = () => {
  return useQuery({
    queryKey: ["sales-transactions"],
    queryFn: () => salesTransactionsService.getAll(),
  });
};

export const useUpdateSalesTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SalesTransactionsFormData> }) =>
      salesTransactionsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales-transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["sales-transactions", variables.id],
      });
      toast.success("Sales Transactions berhasil diperbarui");
    },
    onError: (error) => {
      toast.error("Gagal memperbarui Sales Transactions");
      console.error(error);
    },
  });
};

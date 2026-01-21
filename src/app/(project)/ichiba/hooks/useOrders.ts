// biome-ignore assist/source/organizeImports: <none>
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ordersService } from "../lib/services/orders";
import type { OrderFormData } from "../lib/schemas";

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersService.getAll(),
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersService.getById(id),
    enabled: !!id,
  });
};

// src/hooks/useOrders.ts
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrderFormData) => ordersService.create(data),
    onSuccess: (data) => {
      console.log("Mutation successful, data:", data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
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

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OrderFormData> }) => ordersService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
      toast.success("Order berhasil diperbarui");
    },
    onError: (error) => {
      toast.error("Gagal memperbarui order");
      console.error(error);
    },
  });
};

export const useDeleteOrder = (options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order berhasil dihapus");
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error("Gagal menghapus order");
      console.error(error);
      options?.onError?.(error);
    },
  });
};

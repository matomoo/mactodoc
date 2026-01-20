// biome-ignore assist/source/organizeImports: <none>
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customersService } from "../lib/services/customers";
import type { CustomerFormData } from "../lib/schemas";

export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => customersService.getAll(),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => customersService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomerFormData) => customersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error("Gagal menambahkan customer");
      console.error(error);
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomerFormData> }) => customersService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", variables.id] });
      toast.success("Customer berhasil diperbarui");
    },
    onError: (error) => {
      toast.error("Gagal memperbarui customer");
      console.error(error);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer berhasil dihapus");
    },
    onError: (error) => {
      toast.error("Gagal menghapus customer");
      console.error(error);
    },
  });
};

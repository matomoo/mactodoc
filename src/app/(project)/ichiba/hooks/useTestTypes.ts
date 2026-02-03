// biome-ignore assist/source/organizeImports: <none>
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { testTypesService } from "../lib/services/testTypes";
import type { TestTypeFormData } from "../lib/schemas";
import { toast } from "sonner";

export const useTestTypes = () => {
  return useQuery({
    queryKey: ["test-types"],
    queryFn: () => testTypesService.getAll(),
  });
};

export const useTestType = (id: string) => {
  return useQuery({
    queryKey: ["test-type", id],
    queryFn: () => testTypesService.getById(id),
    enabled: !!id,
  });
};

export const useCreateTestType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TestTypeFormData) => testTypesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-types"] });
      toast.success("TestType berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error("Gagal menambahkan test_type");
      console.error(error);
    },
  });
};

export const useUpdateTestType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TestTypeFormData> }) => testTypesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["test-types"] });
      queryClient.invalidateQueries({ queryKey: ["test-type", variables.id] });
      toast.success("TestType berhasil diperbarui");
    },
    onError: (error) => {
      toast.error("Gagal memperbarui test_type");
      console.error(error);
    },
  });
};

export const useDeleteTestType = (_options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testTypesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-types"] });
      toast.success("TestType berhasil dihapus");
    },
    onError: (error) => {
      toast.error("Gagal menghapus test-types");
      console.error(error);
    },
  });
};

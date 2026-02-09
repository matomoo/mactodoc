// biome-ignore assist/source/organizeImports: <none>
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { catalogsService } from "../lib/servicesApi/catalogs2Service";
import type { CatalogFormData } from "../lib/schemas";

export const useCatalogs2 = () => {
  return useQuery({
    queryKey: ["catalogs"],
    queryFn: () => catalogsService.getAll(),
  });
};

export const useCatalog = (id: string) => {
  return useQuery({
    queryKey: ["catalog", id],
    queryFn: () => catalogsService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCatalog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CatalogFormData) => catalogsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
      toast.success("Catalog berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error("Gagal menambahkan catalog");
      console.error(error);
    },
  });
};

export const useUpdateCatalog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CatalogFormData> }) => catalogsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
      queryClient.invalidateQueries({ queryKey: ["catalog", variables.id] });
      toast.success("Catalog berhasil diperbarui");
    },
    onError: (error) => {
      toast.error("Gagal memperbarui catalog");
      console.error(error);
    },
  });
};

export const useDeleteCatalog = (_options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => catalogsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
      toast.success("Catalog berhasil dihapus");
    },
    onError: (error) => {
      toast.error("Gagal menghapus catalog");
      console.error(error);
    },
  });
};

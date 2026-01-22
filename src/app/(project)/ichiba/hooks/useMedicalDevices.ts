// biome-ignore assist/source/organizeImports: <none>
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { MedicalDeviceFormData } from "../lib/schemas";
import { medicalDevicesService } from "../lib/services/medicalDevices";

export const useMedicalDevices = () => {
  return useQuery({
    queryKey: ["medical_devices"],
    queryFn: () => medicalDevicesService.getAll(),
  });
};

export const useMedicalDevice = (id: string) => {
  return useQuery({
    queryKey: ["medical_devices", id],
    queryFn: () => medicalDevicesService.getById(id),
    enabled: !!id,
  });
};

export const useCreateMedicalDevices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MedicalDeviceFormData) => medicalDevicesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical_devices"] });
      toast.success("Medical Device berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error("Gagal menambahkan Medical Device");
      console.error(error);
    },
  });
};

export const useUpdateMedicalDevices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MedicalDeviceFormData> }) =>
      medicalDevicesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["medical_devices"] });
      queryClient.invalidateQueries({
        queryKey: ["medical_devices", variables.id],
      });
      toast.success("Medical Device berhasil diperbarui");
    },
    onError: (error) => {
      toast.error("Gagal memperbarui Medical Device");
      console.error(error);
    },
  });
};

export const useDeleteMedicalDevice = (options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => medicalDevicesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical_devices"] });
      toast.success("Medical Device berhasil dihapus");
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error("Gagal menghapus Medical Device");
      console.error(error);
      options?.onError?.(error);
    },
  });
};

// biome-ignore assist/source/organizeImports: <none>
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userActivitiesService } from "../lib/services/userActivities";
import type { UserActivitiesFormData } from "../lib/schemas";
import { toast } from "sonner";

export const useUserActivities = () => {
  return useQuery({
    queryKey: ["user-activities"],
    queryFn: () => userActivitiesService.getAll(),
  });
};

export const useUserActivity = (id: string) => {
  return useQuery({
    queryKey: ["user-activity", id],
    queryFn: () => userActivitiesService.getById(id),
    enabled: !!id,
  });
};

export const useCreateUserActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserActivitiesFormData) => userActivitiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-activities"] });
      toast.success("UserActivities berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error("Gagal menambahkan user-activity");
      console.error(error);
    },
  });
};

export const useUpdateUserActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserActivitiesFormData> }) =>
      userActivitiesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-activities"] });
      queryClient.invalidateQueries({
        queryKey: ["user-activity", variables.id],
      });
      toast.success("UserActivities berhasil diperbarui");
    },
    onError: (error) => {
      toast.error("Gagal memperbarui user-activity");
      console.error(error);
    },
  });
};

export const useDeleteUserActivity = (_options?: { onSuccess?: () => void; onError?: (error: Error) => void }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userActivitiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-activities"] });
      toast.success("UserActivities berhasil dihapus");
    },
    onError: (error) => {
      toast.error("Gagal menghapus user-activities");
      console.error(error);
    },
  });
};

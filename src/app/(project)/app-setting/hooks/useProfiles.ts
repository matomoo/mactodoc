// biome-ignore assist/source/organizeImports: <none>
import { useQuery } from "@tanstack/react-query";
import { profilesService } from "../lib/services/profiles";

export const useProfiles = () => {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: () => profilesService.getAll(),
  });
};

export const useProfile = (id: string) => {
  return useQuery({
    queryKey: ["profiles", id],
    queryFn: () => profilesService.getById(id),
    enabled: !!id,
  });
};

// export const useCreateProfile = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (data: CustomerFormData) => customersService.create(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["customers"] });
//       toast.success("Customer berhasil ditambahkan");
//     },
//     onError: (error) => {
//       toast.error("Gagal menambahkan customer");
//       console.error(error);
//     },
//   });
// };

// export const useUpdateProfile = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, data }: { id: string; data: Partial<CustomerFormData> }) => customersService.update(id, data),
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: ["customers"] });
//       queryClient.invalidateQueries({ queryKey: ["customer", variables.id] });
//       toast.success("Customer berhasil diperbarui");
//     },
//     onError: (error) => {
//       toast.error("Gagal memperbarui customer");
//       console.error(error);
//     },
//   });
// };

// export const useDeleteProfile = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (id: string) => customersService.delete(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["customers"] });
//       toast.success("Customer berhasil dihapus");
//     },
//     onError: (error) => {
//       toast.error("Gagal menghapus customer");
//       console.error(error);
//     },
//   });
// };

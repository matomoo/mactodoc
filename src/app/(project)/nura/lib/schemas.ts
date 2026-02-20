import { z } from "zod";

export const profileSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  full_name: z.string().optional(),
  avatar_url: z.string().optional(),
  website: z.string().optional(),
  roles: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

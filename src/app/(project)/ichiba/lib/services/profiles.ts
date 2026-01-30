// biome-ignore assist/source/organizeImports: <none>
import { supabase } from "../supabase";
import type { ProfileFormData } from "../schemas";
import type { Profiles } from "../../types";

export const profilesService = {
  async getAll() {
    const { data, error } = await supabase.from("profiles").select("*").order("full_name");
    if (error) throw error;
    return data as Profiles[];
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();

    if (error) throw error;
    return data as Profiles;
  },

  // async create(profile: ProfileFormData) {
  //   const { data, error } = await supabase.from("profiles").insert([profile]).select().single();

  //   if (error) throw error;
  //   return data as Profiles;
  // },

  // async update(id: string, profile: Partial<ProfileFormData>) {
  //   const { data, error } = await supabase.from("profiles").update(profile).eq("id", id).select().single();

  //   if (error) throw error;
  //   return data as Profiles;
  // },

  async delete(id: string) {
    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) throw error;
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data as Profiles[];
  },
};

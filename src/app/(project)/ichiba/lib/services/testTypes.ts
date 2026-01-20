import type { TestType } from "../../types";
import { supabase } from "../supabase";

export const testTypesService = {
  async getAll() {
    const { data, error } = await supabase.from("test_types").select("*").order("name");

    if (error) throw error;
    return data as TestType[];
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("test_types").select("*").eq("id", id).single();

    if (error) throw error;
    return data as TestType;
  },
};

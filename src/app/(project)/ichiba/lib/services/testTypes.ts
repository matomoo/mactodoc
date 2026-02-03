import type { TestType } from "../../types";
import type { TestTypeFormData } from "../schemas";
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

  async create(testTypeData: TestTypeFormData) {
    const { name, description } = testTypeData;

    try {
      const testType = await supabase
        .from("test_types")
        .insert([
          {
            name,
            description,
          },
        ])
        .select()
        .single();

      if (testType.error) throw testType.error;

      return testType.data as TestType;
    } catch (error) {
      console.error("Service create error:", error);
      throw error;
    }
  },

  async update(id: string, testTypeData: Partial<TestTypeFormData>) {
    const { name, description } = testTypeData;
    try {
      const testType = await supabase
        .from("test_types")
        .update({
          name,
          description,
        })
        .eq("id", id)
        .select()
        .single();

      if (testType.error) throw testType.error;

      return testType.data as TestType;
    } catch (error) {
      console.error("Service update error:", error);
      throw error;
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from("test_types").delete().eq("id", id);

    if (error) throw error;
  },
};

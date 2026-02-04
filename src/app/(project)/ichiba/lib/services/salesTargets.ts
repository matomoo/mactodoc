import type { SalesTarget } from "../../types";
import type { SalesTargetFormData } from "../schemas";
import { supabase } from "../supabase";

export const salesTargetsService = {
  async getAll() {
    const { data, error } = await supabase
      .from("sales_targets")
      .select(
        `
        *,
        sales:profiles (*)
      `,
      )
      .order("id");
    if (error) throw error;
    return data as SalesTarget[];
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("sales_targets").select("*").eq("id", id).single();

    if (error) throw error;
    return data as SalesTarget;
  },

  async create(salesTargetData: SalesTargetFormData) {
    const { profiles_id, target_amount, target_unit } = salesTargetData;

    try {
      const processedData = await supabase
        .from("sales_targets")
        .insert([
          {
            profiles_id,
            target_amount,
            target_unit,
          },
        ])
        .select()
        .single();

      if (processedData.error) throw processedData.error;

      return processedData.data as SalesTarget;
    } catch (error) {
      console.error("Service create error:", error);
      throw error;
    }
  },

  async update(id: string, salesTargetData: Partial<SalesTargetFormData>) {
    const { profiles_id, target_amount, target_unit } = salesTargetData;
    try {
      const processedData = await supabase
        .from("sales_targets")
        .update({
          profiles_id,
          target_amount,
          target_unit,
        })
        .eq("id", id)
        .select()
        .single();

      if (processedData.error) throw processedData.error;

      return processedData.data as SalesTarget;
    } catch (error) {
      console.error("Service update error:", error);
      throw error;
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from("sales_targets").delete().eq("id", id);

    if (error) throw error;
  },
};

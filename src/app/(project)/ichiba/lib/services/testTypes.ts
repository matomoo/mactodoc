import { useAuthStore } from "@/stores/auth-store";

import type { TestType } from "../../types";
import { formatActivityDetails } from "../../utils/format-text-utils";
import type { TestTypeFormData } from "../schemas";
import { supabase } from "../supabase";
import { userActivitiesService } from "./userActivities";

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
      const { data, error } = await supabase
        .from("test_types")
        .insert([
          {
            name,
            description,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (!error && data) {
        const { user } = useAuthStore.getState(); // Call getState() to access outside React
        if (!user?.id) {
          throw new Error("User not authenticated");
        }

        const details = formatActivityDetails("CREATE", "test_types", data);

        await userActivitiesService.create({
          user_id: user.id,
          action: "CREATE",
          entity_type: "test_types",
          entity_id: data.name,
          details: details.structured,
        });
      }

      return data as TestType;
    } catch (error) {
      console.error("Service create error:", error);
      throw error;
    }
  },

  async update(id: string, testTypeData: Partial<TestTypeFormData>) {
    const { name, description } = testTypeData;
    try {
      const { data, error } = await supabase
        .from("test_types")
        .update({
          name,
          description,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      if (!error && data) {
        const { user } = useAuthStore.getState(); // Call getState() to access outside React
        if (!user?.id) {
          throw new Error("User not authenticated");
        }

        const details = formatActivityDetails("UPDATE", "test_types", data);

        await userActivitiesService.create({
          user_id: user.id,
          action: "UPDATE",
          entity_type: "test_types",
          entity_id: data.name,
          details: details.structured,
        });
      }

      return data as TestType;
    } catch (error) {
      console.error("Service update error:", error);
      throw error;
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from("test_types").delete().eq("id", id);

    if (error) throw error;

    if (!error && id) {
      const { user } = useAuthStore.getState(); // Call getState() to access outside React
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const details = formatActivityDetails("DELETE", "test_types", {
        id,
      });

      await userActivitiesService.create({
        user_id: user.id,
        action: "DELETE",
        entity_type: "test_types",
        entity_id: id,
        details: details.structured,
      });
    }
  },
};

import type { UserActivities } from "../../types";
import type { UserActivitiesFormData } from "../schemas";
import { supabase } from "../supabase";

export const userActivitiesService = {
  async getAll() {
    const { data, error } = await supabase
      .from("user_activities")
      .select(
        `
        *,
        user:profiles(*)
      `,
      )
      .order("user_id");

    if (error) throw error;
    return data as UserActivities[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("user_activities")
      .select(
        `
        *,
        user:profiles(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as UserActivities;
  },

  async create(userActivitieData: UserActivitiesFormData) {
    const { user_id, action, entity_type, entity_id, details } = userActivitieData;

    try {
      const userActivitie = await supabase
        .from("user_activities")
        .insert([
          {
            user_id,
            action,
            entity_type,
            entity_id,
            details,
          },
        ])
        .select()
        .single();

      if (userActivitie.error) throw userActivitie.error;

      return userActivitie.data as UserActivities;
    } catch (error) {
      console.error("Service create error:", error);
      throw error;
    }
  },

  async update(id: string, userActivitieData: Partial<UserActivitiesFormData>) {
    const { user_id, action, entity_type, entity_id, details } = userActivitieData;
    try {
      const userActivitie = await supabase
        .from("user_activities")
        .update({
          user_id,
          action,
          entity_type,
          entity_id,
          details,
        })
        .eq("id", id)
        .select()
        .single();

      if (userActivitie.error) throw userActivitie.error;

      return userActivitie.data as UserActivities;
    } catch (error) {
      console.error("Service update error:", error);
      throw error;
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from("user_activities").delete().eq("id", id);

    if (error) throw error;
  },
};

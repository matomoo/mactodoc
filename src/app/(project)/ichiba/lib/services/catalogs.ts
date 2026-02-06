// biome-ignore assist/source/organizeImports: <none>
import { supabase } from "../supabase";
import type { CatalogFormData } from "../schemas";
import type { Catalog } from "../../types";
import { useAuthStore } from "@/stores/auth-store";
import { formatActivityDetails } from "../../utils/format-text-utils";
import { userActivitiesService } from "./userActivities";

export const catalogsService = {
  async getAll() {
    const { data, error } = await supabase.from("catalogs").select("*").order("title");
    if (error) throw error;
    return data as Catalog[];
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("catalogs").select("*").eq("id", id).single();

    if (error) throw error;
    return data as Catalog;
  },

  async create(catalog: CatalogFormData) {
    const { data, error } = await supabase
      .from("catalogs")
      .insert([{ ...catalog, category: catalog.category || "" }])
      .select()
      .single();

    if (error) throw error;

    if (!error && data) {
      const { user } = useAuthStore.getState(); // Call getState() to access outside React
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const details = formatActivityDetails("CREATE", "catalogs", data);

      await userActivitiesService.create({
        user_id: user.id,
        action: "CREATE",
        entity_type: "catalogs",
        entity_id: data.title,
        details: details.structured,
      });
    }

    return data as Catalog;
  },

  async update(id: string, catalog: Partial<CatalogFormData>) {
    const { data, error } = await supabase.from("catalogs").update(catalog).eq("id", id).select().single();

    if (error) throw error;

    if (!error && data) {
      const { user } = useAuthStore.getState(); // Call getState() to access outside React
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const details = formatActivityDetails("UPDATE", "catalogs", data);

      await userActivitiesService.create({
        user_id: user.id,
        action: "UPDATE",
        entity_type: "catalogs",
        entity_id: data.title,
        details: details.structured,
      });
    }

    return data as Catalog;
  },

  async delete(id: string) {
    const { error } = await supabase.from("catalogs").delete().eq("id", id);

    if (error) throw error;

    if (!error && id) {
      const { user } = useAuthStore.getState(); // Call getState() to access outside React
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const details = formatActivityDetails("DELETE", "catalogs", {
        id,
      });

      await userActivitiesService.create({
        user_id: user.id,
        action: "DELETE",
        entity_type: "catalogs",
        entity_id: id,
        details: details.structured,
      });
    }
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from("catalogs")
      .select("*")
      .or(`title.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data as Catalog[];
  },
};

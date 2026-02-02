// biome-ignore assist/source/organizeImports: <none>
import { supabase } from "../supabase";
import type { CatalogFormData } from "../schemas";
import type { Catalog } from "../../types";

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
    return data as Catalog;
  },

  async update(id: string, catalog: Partial<CatalogFormData>) {
    const { data, error } = await supabase.from("catalogs").update(catalog).eq("id", id).select().single();

    if (error) throw error;
    return data as Catalog;
  },

  async delete(id: string) {
    const { error } = await supabase.from("catalogs").delete().eq("id", id);

    if (error) throw error;
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

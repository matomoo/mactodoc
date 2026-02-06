// biome-ignore assist/source/organizeImports: <none>
import { supabase } from "../supabase";
import type { CustomerFormData } from "../schemas";
import type { Customer } from "../../types";
import { userActivitiesService } from "./userActivities";
import { formatActivityDetails } from "../../utils/format-text-utils";
import { useAuthStore } from "@/stores/auth-store";

export const customersService = {
  async getAll() {
    const { data, error } = await supabase.from("customers").select("*").order("name");
    if (error) throw error;
    return data as Customer[];
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();

    if (error) throw error;
    return data as Customer;
  },

  async create(customer: CustomerFormData) {
    const { data, error } = await supabase.from("customers").insert([customer]).select().single();

    if (error) throw error;

    if (!error && data) {
      const { user } = useAuthStore.getState(); // Call getState() to access outside React
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const details = formatActivityDetails("CREATE", "customers", data);

      await userActivitiesService.create({
        user_id: user.id,
        action: "CREATE",
        entity_type: "customers",
        entity_id: data.name,
        details: details.structured,
      });
    }

    return data as Customer;
  },

  async update(id: string, customer: Partial<CustomerFormData>) {
    const { data, error } = await supabase.from("customers").update(customer).eq("id", id).select().single();

    if (error) throw error;

    if (!error && data) {
      const { user } = useAuthStore.getState(); // Call getState() to access outside React
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const details = formatActivityDetails("UPDATE", "customers", data);

      await userActivitiesService.create({
        user_id: user.id,
        action: "UPDATE",
        entity_type: "customers",
        entity_id: data.name,
        details: details.structured,
      });
    }

    return data as Customer;
  },

  async delete(id: string) {
    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) throw error;

    if (!error && id) {
      const { user } = useAuthStore.getState(); // Call getState() to access outside React
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const details = formatActivityDetails("DELETE", "customers", {
        id,
      });

      await userActivitiesService.create({
        user_id: user.id,
        action: "DELETE",
        entity_type: "customers",
        entity_id: id,
        details: details.structured,
      });
    }
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .or(`name.ilike.%${query}%,contact_person.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;

    return data as Customer[];
  },
};

import { useAuthStore } from "@/stores/auth-store";

import type { SalesTarget } from "../../types";
import { formatActivityDetails } from "../../utils/format-text-utils";
import type { SalesTargetFormData } from "../schemas";
import { supabase } from "../supabase";
import { userActivitiesService } from "./userActivities";

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

  // Helper function to get customer name
  async getCustomerName(customerId: string): Promise<string> {
    if (!customerId) return "Unknown Customer";

    try {
      const { data, error } = await supabase.from("profiles").select("full_name").eq("id", customerId).single();

      if (error) {
        console.error("Error fetching customer name:", error);
        return `Customer ID: ${customerId}`;
      }

      return data?.full_name || `Sales ID: ${customerId}`;
    } catch (error) {
      console.error("Error fetching customer name:", error);
      return `Sales ID: ${customerId}`;
    }
  },

  async create(salesTargetData: SalesTargetFormData) {
    const { profiles_id, target_amount, target_unit } = salesTargetData;

    try {
      const { data, error } = await supabase
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

      if (error) throw error;

      if (!error && data) {
        const { user } = useAuthStore.getState(); // Call getState() to access outside React
        if (!user?.id) {
          throw new Error("User not authenticated");
        }

        const customerName = await this.getCustomerName(profiles_id);

        const details = formatActivityDetails("CREATE", "sales_targets", {
          ...data,
          sales_name: customerName, // Add customer name to details
        });

        await userActivitiesService.create({
          user_id: user.id,
          action: "CREATE",
          entity_type: "sales_targets",
          entity_id: customerName,
          details: details.structured,
        });
      }

      return data as SalesTarget;
    } catch (error) {
      console.error("Service create error:", error);
      throw error;
    }
  },

  async update(id: string, salesTargetData: Partial<SalesTargetFormData>) {
    const { profiles_id, target_amount, target_unit } = salesTargetData;
    try {
      const { data, error } = await supabase
        .from("sales_targets")
        .update({
          profiles_id,
          target_amount,
          target_unit,
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

        const currentVisit = await this.getById(id);

        const customerName = profiles_id
          ? await this.getCustomerName(profiles_id)
          : currentVisit.sales?.full_name || "Unknown Customer";

        const details = formatActivityDetails("UPDATE", "sales_targets", {
          ...data,
          sales_name: customerName, // Add customer name to details
        });

        await userActivitiesService.create({
          user_id: user.id,
          action: "UPDATE",
          entity_type: "sales_targets",
          entity_id: customerName,
          details: details.structured,
        });
      }

      return data as SalesTarget;
    } catch (error) {
      console.error("Service update error:", error);
      throw error;
    }
  },

  async delete(id: string) {
    const visit = await this.getById(id);
    const salesName = visit.sales?.full_name || "Unknown Customer";

    const { error } = await supabase.from("sales_targets").delete().eq("id", id);

    if (error) throw error;

    if (!error && id) {
      const { user } = useAuthStore.getState(); // Call getState() to access outside React
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const details = formatActivityDetails("DELETE", "sales_targets", {
        id,
        customer_name: salesName,
      });

      await userActivitiesService.create({
        user_id: user.id,
        action: "DELETE",
        entity_type: "sales_targets",
        entity_id: salesName,
        details: details.structured,
      });
    }
  },
};

// biome-ignore assist/source/organizeImports: <none>
import { useAuthStore } from "@/stores/auth-store";
import type { SalesTransaction } from "../../types";
import type { SalesTransactionsFormData } from "../schemas";
import { supabase } from "../supabase";
import { formatActivityDetails } from "../../utils/format-text-utils";
import { userActivitiesService } from "./userActivities";

export const salesTransactionsService = {
  async getAll() {
    const { data, error } = await supabase
      .from("sales_transactions")
      .select("*")
      .order("customer", { ascending: true });

    if (error) throw error;
    return data as SalesTransaction[];
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("sales_transactions").select("*").eq("id", id).single();

    if (error) throw error;
    return data as SalesTransaction;
  },

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

  async update(id: string, salesTransactionsData: Partial<SalesTransactionsFormData>) {
    const { payment_status } = salesTransactionsData;
    try {
      const { data, error } = await supabase
        .from("sales_transactions")
        .update({
          payment_status,
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

        const userName = user.id ? await this.getCustomerName(user.id) : currentVisit.salesperson || "Unknown Customer";

        const details = formatActivityDetails("UPDATE", "sales_transactions", {
          ...data,
          sales_name: userName,
        });

        await userActivitiesService.create({
          user_id: user.id,
          action: "UPDATE",
          entity_type: "sales_transactions",
          entity_id: userName,
          details: details.structured,
        });
      }

      return data as SalesTransactionsFormData;
    } catch (error) {
      console.error("Service update error:", error);
      throw error;
    }
  },
};

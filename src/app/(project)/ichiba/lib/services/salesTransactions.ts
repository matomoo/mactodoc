import type { SalesTransaction } from "../../types";
import { supabase } from "../supabase";

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
};

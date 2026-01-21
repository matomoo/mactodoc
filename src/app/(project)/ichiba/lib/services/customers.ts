// biome-ignore assist/source/organizeImports: <none>
import { supabase } from "../supabase";
import type { CustomerFormData } from "../schemas";
import type { Customer } from "../../types";

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
    return data as Customer;
  },

  async update(id: string, customer: Partial<CustomerFormData>) {
    const { data, error } = await supabase.from("customers").update(customer).eq("id", id).select().single();

    if (error) throw error;
    return data as Customer;
  },

  async delete(id: string) {
    const { error } = await supabase.from("customers").delete().eq("id", id);

    if (error) throw error;
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

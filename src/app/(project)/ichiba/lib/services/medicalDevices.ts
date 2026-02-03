// biome-ignore assist/source/organizeImports: <none>
import type { MedicalDevices } from "../../types";
import { supabase } from "../supabase";
import type { MedicalDeviceFormData } from "../schemas";

export const medicalDevicesService = {
  async getAll() {
    const { data, error } = await supabase
      .from("medical_devices")
      .select(
        `
        *,
        test_type:test_types(*)
      `,
      )
      .order("name");

    if (error) throw error;
    return data as MedicalDevices[];
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("medical_devices").select("*").eq("id", id).single();

    if (error) throw error;
    return data as MedicalDevices;
  },

  async create(medical_devices: MedicalDeviceFormData) {
    try {
      const { data, error } = await supabase.from("medical_devices").insert([medical_devices]).select().single();

      if (error) throw error;
      return data as MedicalDevices;
    } catch (error) {
      console.error("Service create error:", error);
      throw error;
    }
  },

  async update(id: string, medical_devices: Partial<MedicalDeviceFormData>) {
    const { data, error } = await supabase
      .from("medical_devices")
      .update(medical_devices)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as MedicalDevices;
  },

  async delete(id: string) {
    const { error } = await supabase.from("medical_devices").delete().eq("id", id);

    if (error) throw error;
  },

  async search(query: string) {
    const { data, error } = await supabase.from("medical_devices").select("*").or(`name.ilike.%${query}%`).limit(10);

    if (error) throw error;
    return data as MedicalDevices[];
  },
};

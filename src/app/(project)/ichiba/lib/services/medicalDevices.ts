// biome-ignore assist/source/organizeImports: <none>
import type { MedicalDevices } from "../../types";
import { supabase } from "../supabase";
import type { MedicalDeviceFormData } from "../schemas";
import { userActivitiesService } from "./userActivities";
import { useAuthStore } from "@/stores/auth-store";
import { formatActivityDetails } from "../../utils/format-text-utils";

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

      if (!error && data) {
        const { user } = useAuthStore.getState();
        if (!user?.id) {
          throw new Error("User not authenticated");
        }

        const details = formatActivityDetails("CREATE", "medical_devices", data);

        await userActivitiesService.create({
          user_id: user.id,
          action: "CREATE",
          entity_type: "medical_devices",
          entity_id: data.name,
          details: details.structured,
        });
      }

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

    if (!error && data) {
      const { user } = useAuthStore.getState(); // Call getState() to access outside React
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const details = formatActivityDetails("UPDATE", "medical_devices", data);

      await userActivitiesService.create({
        user_id: user.id,
        action: "UPDATE",
        entity_type: "medical_devices",
        entity_id: data.name,
        details: details.structured,
      });
    }

    return data as MedicalDevices;
  },

  async delete(id: string) {
    const { error } = await supabase.from("medical_devices").delete().eq("id", id);

    if (error) throw error;

    if (!error && id) {
      const { user } = useAuthStore.getState(); // Call getState() to access outside React
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const details = formatActivityDetails("DELETE", "medical_devices", {
        id,
      });

      await userActivitiesService.create({
        user_id: user.id,
        action: "DELETE",
        entity_type: "medical_devices",
        entity_id: id,
        details: details.structured,
      });
    }
  },

  async search(query: string) {
    const { data, error } = await supabase.from("medical_devices").select("*").or(`name.ilike.%${query}%`).limit(10);

    if (error) throw error;
    return data as MedicalDevices[];
  },
};

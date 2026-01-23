// biome-ignore assist/source/organizeImports: <none>
import { supabase } from "../supabase";
import type { Order, Visit, VisitMedicalDevice, VisitWithDetails } from "../../types";
import type { VisitFormData } from "../schemas";

export const visitsService = {
  async getAll() {
    const { data, error } = await supabase
      .from("visits")
      .select(
        `
        *,
        customer:customers(*)
      `,
      )
      .order("tanggal", { ascending: false });

    if (error) throw error;
    return data as Visit[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("visits")
      .select(
        `
        *,
        customer:customers(*),
        visit_medical_devices:visit_medicals(
          *,
          medical_device:medical_devices(*)
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as unknown as VisitWithDetails;
  },

  async create(visitData: VisitFormData) {
    const { customer_id, tanggal, marketing, notes, medical_devices } = visitData;

    try {
      // Start transaction
      const visit = await supabase
        .from("visits")
        .insert([
          {
            customer_id,
            tanggal,
            marketing,
            notes,
          },
        ])
        .select()
        .single();

      if (visit.error) throw visit.error;

      // Add order tests
      if (medical_devices.length > 0) {
        const visitMedicalDevices = medical_devices.map((medical_devices_id) => ({
          visit_id: visit.data.id,
          medical_devices_id,
          status: "pending",
        }));

        const { error: medicalDevicesError } = await supabase.from("visit_medicals").insert(visitMedicalDevices);

        if (medicalDevicesError) throw medicalDevicesError;
      }

      return visit.data as Order;
    } catch (error) {
      console.error("Service create error:", error);
      throw error;
    }
  },

  async update(id: string, visitData: Partial<VisitFormData>) {
    const { customer_id, tanggal, marketing, notes, medical_devices } = visitData;
    try {
      const visit = await supabase
        .from("visits")
        .update({
          customer_id,
          tanggal,
          marketing,
          notes,
          // updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (visit.error) throw visit.error;

      // Update medical_devices if provided
      if (medical_devices) {
        // Delete existing tests
        await supabase.from("visit_medicals").delete().eq("visit_id", id);

        // Insert new medical_devices
        if (medical_devices.length > 0) {
          const visitMedicalDevices = medical_devices.map((medical_devices_id) => ({
            visit_id: id,
            medical_devices_id,
            status: "pending",
          }));

          const { error: medicalDevicesError } = await supabase.from("visit_medicals").insert(visitMedicalDevices);

          if (medicalDevicesError) throw medicalDevicesError;
        }
      }

      return visit.data as Visit;
    } catch (error) {
      console.error("Service update error:", error);
      throw error;
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from("visits").delete().eq("id", id);

    if (error) throw error;
  },

  async updateVisitTest(visitId: string, medicalDevices: string, data: Partial<VisitMedicalDevice>) {
    const { data: VisitMedicalDevice, error } = await supabase
      .from("visit_medicals")
      .update(data)
      .eq("visit_id", visitId)
      .eq("medical_devices_id", medicalDevices)
      .select()
      .single();

    if (error) throw error;
    return VisitMedicalDevice;
  },

  async getByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from("visits")
      .select(
        `
        *,
        customer:customers(*),
        visit_medical_devices:visit_medicals(
          *,
          medical_device:medical_devices(*)
        )
      `,
      )
      .gte("tanggal", startDate)
      .lte("tanggal", endDate)
      .order("tanggal", { ascending: false });

    if (error) throw error;
    return data as unknown as VisitWithDetails[];
  },
};

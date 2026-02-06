// biome-ignore assist/source/organizeImports: <none>
import { supabase } from "../supabase";
import type { Visit, VisitMedicalDevice, VisitWithDetails } from "../../types";
import type { VisitFormData } from "../schemas";
import { useAuthStore } from "@/stores/auth-store";
import { formatActivityDetails } from "../../utils/format-text-utils";
import { userActivitiesService } from "./userActivities";

export const visitsService = {
  async getAll() {
    const { data, error } = await supabase
      .from("visits")
      .select(
        `
        *,
        customer:customers(*),
        sales:profiles(*)
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

  // Helper function to get customer name
  async getCustomerName(customerId: string): Promise<string> {
    if (!customerId) return "Unknown Customer";

    try {
      const { data, error } = await supabase.from("customers").select("name").eq("id", customerId).single();

      if (error) {
        console.error("Error fetching customer name:", error);
        return `Customer ID: ${customerId}`;
      }

      return data?.name || `Customer ID: ${customerId}`;
    } catch (error) {
      console.error("Error fetching customer name:", error);
      return `Customer ID: ${customerId}`;
    }
  },

  async create(visitData: VisitFormData) {
    const { customer_id, tanggal, sales_id, notes, medical_devices } = visitData;

    try {
      // Get customer name for activity log
      const customerName = await this.getCustomerName(customer_id);

      // Start transaction
      const { data, error } = await supabase
        .from("visits")
        .insert([
          {
            customer_id,
            tanggal,
            sales_id,
            notes,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Add order tests
      if (medical_devices.length > 0) {
        const visitMedicalDevices = medical_devices.map((medical_devices_id) => ({
          visit_id: data.id,
          medical_devices_id,
          status: "pending",
        }));

        const { error: medicalDevicesError } = await supabase.from("visit_medicals").insert(visitMedicalDevices);

        if (medicalDevicesError) throw medicalDevicesError;
      }

      if (!error && data) {
        const { user } = useAuthStore.getState();
        if (!user?.id) {
          throw new Error("User not authenticated");
        }

        const details = formatActivityDetails("CREATE", "visits", {
          ...data,
          customer_name: customerName, // Add customer name to details
        });

        await userActivitiesService.create({
          user_id: user.id,
          action: "CREATE",
          entity_type: "visits",
          entity_id: customerName, // Use customer name as entity_id
          details: details.structured,
        });
      }

      return data as Visit;
    } catch (error) {
      console.error("Service create error:", error);
      throw error;
    }
  },

  async update(id: string, visitData: Partial<VisitFormData>) {
    const { customer_id, tanggal, sales_id, notes, medical_devices } = visitData;

    try {
      // Get the current visit to compare data
      const currentVisit = await this.getById(id);

      // Get customer name for activity log
      const customerName = customer_id
        ? await this.getCustomerName(customer_id)
        : currentVisit.customer?.name || "Unknown Customer";

      const { data, error } = await supabase
        .from("visits")
        .update({
          customer_id,
          tanggal,
          sales_id,
          notes,
          // updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

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

      if (!error && data) {
        const { user } = useAuthStore.getState();
        if (!user?.id) {
          throw new Error("User not authenticated");
        }

        const details = formatActivityDetails(
          "UPDATE",
          "visits",
          {
            ...data,
            customer_name: customerName,
          },
          {
            ...currentVisit,
            customer_name: currentVisit.customer?.name || "Unknown Customer",
          },
        );

        await userActivitiesService.create({
          user_id: user.id,
          action: "UPDATE",
          entity_type: "visits",
          entity_id: customerName, // Use customer name as entity_id
          details: details.structured,
        });
      }

      return data as Visit;
    } catch (error) {
      console.error("Service update error:", error);
      throw error;
    }
  },

  async delete(id: string) {
    // Get visit data before deleting for activity log
    const visit = await this.getById(id);
    const customerName = visit.customer?.name || "Unknown Customer";

    const { error } = await supabase.from("visits").delete().eq("id", id);

    if (error) throw error;

    if (!error && id) {
      const { user } = useAuthStore.getState();
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const details = formatActivityDetails("DELETE", "visits", {
        id,
        customer_name: customerName,
        tanggal: visit.tanggal,
        notes: visit.notes,
      });

      await userActivitiesService.create({
        user_id: user.id,
        action: "DELETE",
        entity_type: "visits",
        entity_id: customerName, // Use customer name as entity_id
        details: details.structured,
      });
    }
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

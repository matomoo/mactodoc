// biome-ignore assist/source/organizeImports: <none>
import { supabase } from "../supabase";
import type { Order, OrderTest, OrderWithDetails } from "../../types";
import type { OrderFormData } from "../schemas";

export const ordersService = {
  async getAll() {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customer:customers(*)
      `,
      )
      .order("tanggal", { ascending: false });

    if (error) throw error;
    return data as Order[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customer:customers(*),
        order_tests:order_tests(
          *,
          test_type:test_types(*)
        )
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as OrderWithDetails;
  },

  async create(orderData: OrderFormData) {
    const { customer_id, tanggal, marketing, notes, test_types } = orderData;

    try {
      // Start transaction
      const order = await supabase
        .from("orders")
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

      if (order.error) throw order.error;

      // Add order tests
      if (test_types.length > 0) {
        const orderTests = test_types.map((test_type_id) => ({
          order_id: order.data.id,
          test_type_id,
          status: "pending",
        }));

        const { error: testsError } = await supabase.from("order_tests").insert(orderTests);

        if (testsError) throw testsError;
      }

      return order.data as Order;
    } catch (error) {
      console.error("Service create error:", error);
      throw error;
    }
  },

  async update(id: string, orderData: Partial<OrderFormData>) {
    const { customer_id, tanggal, marketing, notes, test_types } = orderData;

    const order = await supabase
      .from("orders")
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

    if (order.error) throw order.error;

    // Update order tests if provided
    if (test_types) {
      // Delete existing tests
      await supabase.from("order_tests").delete().eq("order_id", id);

      // Insert new tests
      if (test_types.length > 0) {
        const orderTests = test_types.map((test_type_id) => ({
          order_id: id,
          test_type_id,
          status: "pending",
        }));

        const { error: testsError } = await supabase.from("order_tests").insert(orderTests);

        if (testsError) throw testsError;
      }
    }

    return order.data as Order;
  },

  async delete(id: string) {
    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) throw error;
  },

  async updateOrderTest(orderId: string, testTypeId: string, data: Partial<OrderTest>) {
    const { data: orderTest, error } = await supabase
      .from("order_tests")
      .update(data)
      .eq("order_id", orderId)
      .eq("test_type_id", testTypeId)
      .select()
      .single();

    if (error) throw error;
    return orderTest;
  },

  async getByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        customer:customers(*),
        order_tests:order_tests(
          *,
          test_type:test_types(*)
        )
      `,
      )
      .gte("tanggal", startDate)
      .lte("tanggal", endDate)
      .order("tanggal", { ascending: false });

    if (error) throw error;
    return data as OrderWithDetails[];
  },
};

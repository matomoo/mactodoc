"use server";

// biome-ignore assist/source/organizeImports: <none>
import { revalidatePath } from "next/cache";
import type { ExcelData } from "../types/import";
import { supabase } from "../lib/supabase";

export async function importDataAction(data: ExcelData[]): Promise<{
  success: boolean;
  message: string;
  insertedCount?: number;
}> {
  try {
    const transformedData = data.map((item) => ({
      customer: item.Pelanggan,
      product_name: item["Nama Barang"],
      date: item.Tanggal,
      salesperson: item["Nama Default Penjual Pelang"],
      quantity: item.Kuantitas,
      sales_amount: item.Penjualan,
      category: item.Category,
      region: item.Wilayah,
      type: item.Type,
      created_at: new Date().toISOString(),
    }));

    const { data: insertedData, error } = await supabase
      .from("sales_transactions") // Your table name here
      .insert(transformedData)
      .select();

    if (error) throw error;

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Data imported successfully",
      insertedCount: insertedData?.length,
    };
  } catch (error) {
    console.error("Import error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to import data",
    };
  }
}

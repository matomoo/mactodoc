"use server";

// biome-ignore assist/source/organizeImports: <none>
import { revalidatePath } from "next/cache";
import type { ExcelData, ImportResult } from "../../types/import";
import { supabase } from "../supabase";

// Function to remove duplicates within the dataset
const deduplicateData = (data: any[]): any[] => {
  const seen = new Map<string, any>();
  const duplicates: string[] = [];

  data.forEach((item, index) => {
    const key = `${item.customer}_${item.product_name}_${item.date}`;
    if (seen.has(key)) {
      duplicates.push(`Row ${index + 1}: Duplicate of ${key}`);
      // Keep the latest occurrence (or you could sum quantities/sales)
    } else {
      seen.set(key, item);
    }
  });

  if (duplicates.length > 0) {
    console.log(`Found ${duplicates.length} duplicates within the dataset`);
    console.log("Sample duplicates:", duplicates.slice(0, 3));
  }

  return Array.from(seen.values());
};

// Update function to accept data as parameter
export async function importExcelData(data: ExcelData[]): Promise<ImportResult> {
  try {
    if (!data || data.length === 0) {
      return {
        success: false,
        message: "No data to import",
        error: "No data provided",
      };
    }

    console.log(`Processing ${data.length} records for import...`);

    // Transform data to match your Supabase table structure
    const transformedData = data.map((item) => ({
      customer: item.Pelanggan?.trim() || "",
      product_name: item["Nama Barang"]?.trim() || "",
      date: formatDate(item.Tanggal), // Ensure proper date format
      salesperson: item["Nama Default Penjual Pelang"]?.trim() || null,
      quantity: Number(item.Kuantitas) || 0,
      sales_amount: Number(item.Penjualan) || 0,
      category: item.Category?.trim() || "Lainnya",
      type: item.Type?.trim() || null,
      region: item.Wilayah?.trim() || null,
      nomor_invoice: item["Nomor Invoice"]?.trim() || null,
      po_number: item["PO Number"]?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Remove duplicates within the dataset BEFORE upsert
    const deduplicatedData = deduplicateData(transformedData);

    console.log(`After deduplication: ${deduplicatedData.length} unique records`);

    // Validate transformed data
    const invalidRecords = deduplicatedData.filter(
      (record) => !record.customer || !record.product_name || !record.date,
    );

    if (invalidRecords.length > 0) {
      return {
        success: false,
        message: "Data validation failed",
        error: `${invalidRecords.length} records missing required fields (customer, product_name, or date)`,
      };
    }

    // Use batch processing to avoid the "cannot affect row a second time" error
    const result = await processBatches(deduplicatedData);

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard/reports");

    return result;
  } catch (error) {
    console.error("Import error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Process data in smaller batches with duplicate check per batch
async function processBatches(data: any[]): Promise<ImportResult> {
  const batchSize = 100; // Smaller batch size to avoid conflicts
  const batches = [];
  const warnings: string[] = [];

  // Split data into batches
  for (let i = 0; i < data.length; i += batchSize) {
    batches.push(data.slice(i, i + batchSize));
  }

  let totalAffected = 0;
  const errors: string[] = [];

  console.log(`Processing ${batches.length} batches of up to ${batchSize} records each`);

  // Process each batch
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    try {
      // Further deduplicate within each batch
      const uniqueBatch = deduplicateData(batch);

      if (uniqueBatch.length < batch.length) {
        warnings.push(`Batch ${i + 1}: Removed ${batch.length - uniqueBatch.length} duplicates within batch`);
      }

      console.log(`Processing batch ${i + 1}/${batches.length} with ${uniqueBatch.length} unique records`);

      const { data: batchData, error: batchError } = await supabase
        .from("sales_transactions")
        .upsert(uniqueBatch, {
          onConflict: "customer,product_name,date",
        })
        .select();

      if (batchError) {
        console.error(`Batch ${i + 1} error:`, batchError);

        // If batch fails due to duplicates, try individual upsert
        if (batchError.code === "21000" || batchError.message.includes("cannot affect row a second time")) {
          const individualResult = await processIndividualUpsert(uniqueBatch);
          totalAffected += individualResult.affected;
          if (individualResult.errors.length > 0) {
            errors.push(`Batch ${i + 1} individual errors: ${individualResult.errors.join(", ")}`);
          }
        } else {
          errors.push(`Batch ${i + 1}: ${batchError.message}`);
          // Try individual upsert as fallback
          const individualResult = await processIndividualUpsert(uniqueBatch);
          totalAffected += individualResult.affected;
        }
      } else {
        totalAffected += batchData?.length || 0;
        console.log(`Batch ${i + 1} successful: ${batchData?.length || 0} records affected`);
      }
    } catch (batchError) {
      console.error(`Batch ${i + 1} failed:`, batchError);
      errors.push(`Batch ${i + 1} failed: ${batchError}`);

      // Try individual upsert as last resort
      const individualResult = await processIndividualUpsert(batch);
      totalAffected += individualResult.affected;
    }
  }

  // Compile results
  const result: ImportResult = {
    success: totalAffected > 0 || errors.length === 0,
    message:
      totalAffected > 0
        ? `Successfully processed ${totalAffected} records${warnings.length > 0 ? " (with warnings)" : ""}`
        : "No records were processed",
    insertedCount: totalAffected,
  };

  if (errors.length > 0) {
    result.error = errors.slice(0, 5).join("; "); // Limit error output
    if (errors.length > 5) {
      result.error += `... and ${errors.length - 5} more errors`;
    }
  }

  // if (warnings.length > 0) {
  //   result.warnings = warnings;
  // }

  return result;
}

// Process records individually (slower but reliable)
async function processIndividualUpsert(batch: any[]): Promise<{ affected: number; errors: string[] }> {
  let affected = 0;
  const errors: string[] = [];

  console.log(`Processing ${batch.length} records individually...`);

  for (let i = 0; i < batch.length; i++) {
    const record = batch[i];

    try {
      // Use upsert for individual record
      const { data, error } = await supabase
        .from("sales_transactions")
        .upsert(record, {
          onConflict: "customer,product_name,date",
        })
        .select()
        .single(); // Use single() since we're upserting one record

      if (error) {
        // If even individual upsert fails, try insert with conflict ignore
        const { error: insertError } = await supabase.from("sales_transactions").insert(record).select();

        if (insertError) {
          errors.push(`Record ${i + 1}: ${record.customer} - ${record.product_name} - ${insertError.message}`);
        } else {
          affected++;
        }
      } else {
        affected++;
      }
    } catch (recordError) {
      errors.push(`Record ${i + 1} failed: ${recordError}`);
    }

    // Add small delay between individual operations if needed
    if (i % 50 === 0 && i > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log(`Individual processing: ${affected}/${batch.length} successful`);

  return { affected, errors };
}

// Helper function to format date properly
function formatDate(dateValue: any): string {
  if (!dateValue) return "";

  try {
    // If it's already a string in ISO format
    if (typeof dateValue === "string") {
      // Try to parse various date formats
      const date = new Date(dateValue);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }

      // Try Excel serial date format
      if (dateValue.match(/^\d+$/)) {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + Number(dateValue) * 24 * 60 * 60 * 1000);
        return date.toISOString().split("T")[0];
      }
    }

    // If it's a Date object
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split("T")[0];
    }

    // If it's a number (Excel serial)
    if (typeof dateValue === "number") {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
      return date.toISOString().split("T")[0];
    }
  } catch (error) {
    console.error("Date formatting error:", error, dateValue);
  }

  // Return as-is if we can't parse it
  return dateValue?.toString() || "";
}

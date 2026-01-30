"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useState } from "react";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ExcelData } from "../../types/import";
import ImportForm from "../../components/import/ImportForm";
import DataPreview from "../../components/import/DataPreview";

export default function ImportPage() {
  const [excelData, setExcelData] = useState<ExcelData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const router = useRouter();

  const handleFileUpload = (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        }) as any[][];

        // Get headers (assuming first row)
        const headers = jsonData[0] as string[];

        // Map data to ExcelData structure
        const mappedData: ExcelData[] = jsonData
          .slice(1)
          .map((row) => {
            const excelDateToJSDate = (serial: number): Date => {
              // Excel's epoch is 1900-01-00 (day 0), but it incorrectly considers 1900 a leap year
              // JavaScript's epoch is 1970-01-01
              const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
              const jsDate = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);

              // Adjust for Excel's incorrect leap year calculation
              if (serial >= 60) {
                jsDate.setDate(jsDate.getDate() - 1);
              }

              return jsDate;
            };

            const formatExcelDate = (dateValue: any): string => {
              if (!dateValue && dateValue !== 0) return ""; // Handle null, undefined, empty string

              try {
                // If it's already a string date
                if (typeof dateValue === "string") {
                  const date = new Date(dateValue);
                  if (!isNaN(date.getTime())) {
                    return date.toISOString().split("T")[0]; // YYYY-MM-DD
                  }
                  return dateValue; // Return as-is if can't parse
                }

                // If it's a Date object
                if (dateValue instanceof Date) {
                  return dateValue.toISOString().split("T")[0];
                }

                // If it's a number (Excel serial date)
                if (typeof dateValue === "number") {
                  // Check if it's an Excel date (numbers around 40000+ are likely dates)
                  if (dateValue > 20000) {
                    // Dates after ~1954
                    const jsDate = excelDateToJSDate(dateValue);
                    return jsDate.toISOString().split("T")[0];
                  }
                  // Small number might be a regular number, not a date
                  return dateValue.toString();
                }

                // For any other type
                return dateValue.toString();
              } catch (error) {
                console.error("Date formatting error:", error, dateValue);
                return dateValue?.toString() || "";
              }
            };

            // Find indices for each required column
            const columnIndices = {
              Pelanggan: headers.indexOf("Pelanggan"),
              "Nama Barang": headers.indexOf("Nama Barang"),
              Tanggal: headers.indexOf("Tanggal"),
              "Nama Default Penjual Pelang": headers.indexOf("Nama Default Penjual Pelang"),
              Kuantitas: headers.indexOf("Kuantitas"),
              Penjualan: headers.indexOf("Penjualan"),
              Category: headers.indexOf("Category"),
              Wilayah: headers.indexOf("Wilayah"),
              Type: headers.indexOf("Type"),
            };

            return {
              Pelanggan: row[columnIndices.Pelanggan] || "",
              "Nama Barang": row[columnIndices["Nama Barang"]] || "",
              Tanggal: formatExcelDate(row[columnIndices.Tanggal]),
              "Nama Default Penjual Pelang": row[columnIndices["Nama Default Penjual Pelang"]] || "",
              Kuantitas: Number(row[columnIndices.Kuantitas]) || 0,
              Penjualan: Number(row[columnIndices.Penjualan]) || 0,
              Category: row[columnIndices.Category] || "",
              Type: row[columnIndices.Type] || "",
              Wilayah: row[columnIndices.Wilayah] || "",
            };
          })
          .filter((row) => row.Pelanggan); // Remove empty rows

        setExcelData(mappedData);
        toast.success(`${mappedData.length} data rows loaded successfully`);
      } catch (error) {
        console.error("Error reading Excel file:", error);
        toast.error("Failed to read Excel file");
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setIsLoading(false);
      toast.error("Error reading file");
    };

    reader.readAsBinaryString(file);
    setFileName(file.name);
  };

  const handleClearData = () => {
    setExcelData([]);
    setFileName("");
    toast.info("Data cleared");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Import Excel Data</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Upload Excel file with customer sales data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <ImportForm
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            fileName={fileName}
            onClear={handleClearData}
            hasData={excelData.length > 0}
            excelData={excelData} // Pass data to ImportForm
          />
        </div>

        {excelData.length > 0 && (
          <div>
            <DataPreview data={excelData} />
          </div>
        )}
      </div>
    </div>
  );
}

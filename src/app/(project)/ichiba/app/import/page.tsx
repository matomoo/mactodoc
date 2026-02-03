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
            const excelDateToJSDateWithTimezone = (serial: number): Date => {
              const excelEpoch = Date.UTC(1899, 11, 31);

              const utcTime = excelEpoch + serial * 24 * 60 * 60 * 1000;

              const jsDate = new Date(utcTime);

              if (serial >= 61) {
                jsDate.setUTCDate(jsDate.getUTCDate() - 1);
              }

              return jsDate;
            };

            const excelDateToFormattedString = (
              serial: number,
              format: "YYYY-MM-DD" | "local" = "YYYY-MM-DD",
            ): string => {
              const date = excelDateToJSDateWithTimezone(serial);
              console.log("date", date);
              console.log(serial);

              if (format === "YYYY-MM-DD") {
                const year = date.getUTCFullYear();
                const month = String(date.getUTCMonth() + 1).padStart(2, "0");
                const day = String(date.getUTCDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
              }

              return date.toLocaleDateString();
            };

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
              Tanggal: excelDateToFormattedString(row[columnIndices.Tanggal]),
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

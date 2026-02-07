"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useState, useRef } from "react";
import { Upload, FileX, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { importExcelData } from "../../lib/services/importExcel";
import type { ExcelData } from "../../types/import"; // Add this import

interface ImportFormProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  fileName: string;
  onClear: () => void;
  hasData: boolean;
  excelData: ExcelData[]; // Add this prop to receive the data
}

export default function ImportForm({
  onFileUpload,
  isLoading,
  fileName,
  onClear,
  hasData,
  excelData, // Add this prop
}: ImportFormProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ];

      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
        toast.error("Please upload an Excel file (.xlsx, .xls, .csv)");
        return;
      }

      onFileUpload(file);
    }
  };

  const handleImport = async () => {
    if (!hasData || !excelData || excelData.length === 0) {
      toast.error("No data to import");
      return;
    }

    setIsImporting(true);
    try {
      // Pass excelData as parameter
      const result = await importExcelData(excelData);

      if (result.success) {
        toast.success(`Successfully imported ${result.insertedCount} records`);
        onClear();
      } else {
        toast.error(result.error || "Failed to import data");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("An error occurred during import");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <h2 className="mb-4 font-semibold text-gray-900 text-xl dark:text-white">Upload Excel File</h2>

      <button
        type="button"
        className={`mb-6 w-full cursor-pointer rounded-lg border-2 border-dashed p-8 text-left transition-colors ${isLoading ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-400"}`}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx,.xls,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
        />

        {isLoading ? (
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-500" />
        ) : (
          <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
        )}

        <p className="mb-2 text-gray-600 dark:text-gray-400">
          {fileName || "Drag & drop Excel file here or click to browse"}
        </p>
        <p className="text-gray-500 text-sm dark:text-gray-500">Supports .xlsx, .xls, .csv files</p>
      </button>

      {fileName && (
        <div className="mb-6 flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
          <div className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            <span className="text-green-700 dark:text-green-400">{fileName} loaded</span>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            <FileX className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div className="text-gray-600 text-sm dark:text-gray-400">
          <h3 className="mb-2 font-semibold">Expected Columns:</h3>
          <ul className="grid grid-cols-2 gap-2">
            <li>• Pelanggan</li>
            <li>• Nomor Invoice</li>
            <li>• PO Number</li>
            <li>• Nama Barang</li>
            <li>• Tanggal</li>
            <li>• Nama Default Penjual Pelang</li>
            <li>• Kuantitas</li>
            <li>• Penjualan</li>
            <li>• Category</li>
            <li>• Wilayah</li>
            <li>• Type</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={handleImport}
          disabled={!hasData || isImporting || !excelData.length}
          className={`flex w-full items-center justify-center rounded-lg px-4 py-3 font-medium ${
            hasData && !isImporting && excelData.length
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          }`}
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Importing...
            </>
          ) : (
            `Import ${excelData.length} records`
          )}
        </button>

        {excelData.length > 0 && (
          <p className="text-center text-gray-500 text-sm dark:text-gray-400">
            Ready to import {excelData.length} records
          </p>
        )}
      </div>
    </div>
  );
}

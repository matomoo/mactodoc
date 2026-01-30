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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload Excel File</h2>

      <button
        type="button"
        className={`mb-6 w-full cursor-pointer rounded-lg border-2 border-dashed p-8 text-left text-center transition-colors ${isLoading ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400"}`}
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
          <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
        ) : (
          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        )}

        <p className="text-gray-600 dark:text-gray-400 mb-2">
          {fileName || "Drag & drop Excel file here or click to browse"}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">Supports .xlsx, .xls, .csv files</p>
      </button>

      {fileName && (
        <div className="flex items-center justify-between mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700 dark:text-green-400">{fileName} loaded</span>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >
            <FileX className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <h3 className="font-semibold mb-2">Expected Columns:</h3>
          <ul className="grid grid-cols-2 gap-2">
            <li>• Pelanggan</li>
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
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center
            ${
              hasData && !isImporting && excelData.length
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
        >
          {isImporting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            `Import ${excelData.length} records`
          )}
        </button>

        {excelData.length > 0 && (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Ready to import {excelData.length} records
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

/**
 * ExportReportButton.tsx
 * Drop this anywhere in your Next.js app.
 * Pass your filteredData array as a prop.
 *
 * Usage:
 *   import ExportReportButton from "@/components/ExportReportButton";
 *   <ExportReportButton data={filteredData} />
 */

// biome-ignore assist/source/organizeImports: <none>
import { useState } from "react";
import { reportPerformance } from "../../_lib/reportPerformance-3";
import type { RawKpiRow } from "../../_lib/reportPerformance";

interface ExportReportButtonProps {
  data: RawKpiRow[];
  fileName?: string;
  className?: string;
  selectedKPIs: string[];
  filteredComparisonData: any;
  groupBy: string;
}

export default function ExportReportButton({
  data,
  fileName,
  className,
  selectedKPIs = ["Payload"],
  filteredComparisonData,
  groupBy = "noGrup",
}: ExportReportButtonProps) {
  const [loading, setLoading] = useState(false);

  console.log({ data });

  async function handleExport(): Promise<void> {
    if (!data?.length) {
      alert("No data to export.");
      return;
    }
    setLoading(true);
    try {
      await reportPerformance({
        filteredData: data,
        fileName,
        selectedKpis: selectedKPIs,
        filteredComparisonData,
        groupBy,
      });
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to generate report. See console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      type="button"
      disabled={loading}
      className={
        className ??
        `inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 font-semibold text-sm text-white shadow-sm transition-colors hover:bg-teal-700 disabled:opacity-50`
      }
    >
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <title>spin</title>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Generating…
        </>
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <title>export</title>
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Export to PowerPoint
        </>
      )}
    </button>
  );
}

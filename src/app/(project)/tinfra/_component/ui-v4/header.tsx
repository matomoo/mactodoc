// components/header.tsx
"use client";

import { Download, Filter } from "lucide-react";

// import { Download, Filter } from "lucide-react";
import type { RawKpiPlos4G, RawKpiRow } from "../../_lib/reportPerformance-3";
import ExportReportButton from "../ui-v3/ExportReportButton";

interface HeaderProps {
  onExportData: () => void;
  onToggleMobileFilters: () => void;
  title?: string;
  subtitle?: string;
  data?: RawKpiRow[];
  dataPlos?: RawKpiPlos4G[];
  selectedKPIs?: string[];
  filteredComparisonData?: RawKpiRow[];
  groupBy?: string;
}

export function Header({
  onExportData,
  onToggleMobileFilters,
  title,
  subtitle,
  data,
  dataPlos,
  selectedKPIs,
  filteredComparisonData,
  groupBy = "noGrup",
}: HeaderProps) {
  return (
    <div className="sticky top-13 z-30 mt-4 rounded-lg border-b bg-white px-4 py-2 shadow-sm lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900 text-xl">{title || "2G Network Performance"}</h1>
          <p className="text-gray-600 text-sm">{subtitle || "Real-time metrics and analysis dashboard"}</p>
        </div>
        <div className="flex flex-row gap-4">
          <ExportReportButton
            data={data as unknown as RawKpiRow[]}
            dataPlos={dataPlos as unknown as RawKpiPlos4G[]}
            selectedKPIs={selectedKPIs || []}
            filteredComparisonData={filteredComparisonData || []}
            groupBy={groupBy}
          />
          {groupBy === "G4_SITEID_CELLID" && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onExportData}
                className="hidden items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 lg:flex"
              >
                <Download size={16} />
                Export to Excel
              </button>
              <button
                type="button"
                onClick={onToggleMobileFilters}
                className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 lg:hidden"
              >
                <Filter size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

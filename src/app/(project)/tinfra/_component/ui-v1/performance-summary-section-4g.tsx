"use client";

// biome-ignore assist/source/organizeImports: <will fix later>
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Data2G4GModel } from "@/types/schema";
import TableComparison2G4GDaily from "./table-comparison-2g-4g-daily-v1";

interface PerformanceSummarySectionProps {
  metrics: {
    productivity: { value: number; percentage: string };
    tchTraffic: { value: number; percentage: string };
    totalPayload: { value: number; percentage: string };
  };
  filteredData: Data2G4GModel[];
  filterBy: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function PerformanceSummaryToggle({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
    >
      {isExpanded ? (
        <>
          <ChevronUp size={16} />
          <span>Collapse Summary</span>
        </>
      ) : (
        <>
          <ChevronDown size={16} />
          <span>Expand Summary</span>
        </>
      )}
    </button>
  );
}

export function SummaryCard({
  title,
  value,
  description,
  color = "blue",
}: {
  title: string;
  value: string;
  description: string;
  color?: "blue" | "green" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  const label = {
    blue: "Prod",
    green: "Traffic",
    purple: "Payload",
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-500 text-sm">{title}</div>
          <div className="mt-1 font-bold text-2xl text-gray-900">{value}</div>
        </div>
        <div className={`rounded-full p-2 ${colorClasses[color]}`}>
          <div className="font-semibold text-sm">{label[color]}</div>
        </div>
      </div>
      <div className="mt-2 text-gray-500 text-xs">{description}</div>
    </div>
  );
}

export function PerformanceSummarySection4G({ filteredData }: PerformanceSummarySectionProps) {
  return (
    <div className="mb-6">
      <div className="mb-4 flex flex-col items-center justify-between">
        <div className="w-full max-w-full overflow-hidden overflow-x-hidden rounded-xl border bg-white shadow-sm">
          <TableComparison2G4GDaily data={filteredData} tech="4G" />
        </div>
      </div>
    </div>
  );
}

export default PerformanceSummarySection4G;

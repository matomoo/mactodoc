"use client";

// biome-ignore assist/source/organizeImports: <will fix later>
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
  selectedKPIs: string[];
  onSelectedKPIsChange: (selected: string[]) => void;
  onFilteredComparisonDataChange?: (data: any[]) => void;
  tech?: string;
}

export function PerformanceSummarySection5G({
  filteredData,
  selectedKPIs,
  onSelectedKPIsChange,
  onFilteredComparisonDataChange,
  tech = "5G",
}: PerformanceSummarySectionProps) {
  return (
    <div className="mb-6">
      <div className="mb-4 flex flex-col items-center justify-between">
        <div className="w-full max-w-full overflow-hidden overflow-x-hidden rounded-xl border bg-white shadow-sm">
          <TableComparison2G4GDaily
            data={filteredData}
            selectedKPIs={selectedKPIs}
            onSelectedKPIsChange={onSelectedKPIsChange}
            tech={tech}
            onFilteredComparisonDataChange={onFilteredComparisonDataChange}
          />
        </div>
      </div>
    </div>
  );
}

export default PerformanceSummarySection5G;

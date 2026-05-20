"use client";

// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import TableComparisonProductivityAll from "./table-comparison-productivity-all";

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
}

export function PerformanceSummarySectionProductivityAll({
  filteredData,
  selectedKPIs,
  onSelectedKPIsChange,
  onFilteredComparisonDataChange,
}: PerformanceSummarySectionProps) {
  console.log({ selectedKPIs });
  return (
    <div className="mb-6">
      <div className="mb-4 flex flex-col items-center justify-between">
        <div className="w-full max-w-full overflow-hidden overflow-x-hidden rounded-xl border bg-white shadow-sm">
          <TableComparisonProductivityAll
            data={filteredData}
            selectedKPIs={selectedKPIs}
            onSelectedKPIsChange={onSelectedKPIsChange}
            tech="All"
            onFilteredComparisonDataChange={onFilteredComparisonDataChange}
          />
        </div>
      </div>
    </div>
  );
}

export default PerformanceSummarySectionProductivityAll;

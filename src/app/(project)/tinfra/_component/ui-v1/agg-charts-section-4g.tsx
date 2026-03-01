// components/charts-section.tsx
"use client";

import { useState } from "react";

import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { Data2G4GModel } from "@/types/schema";

import LineChart4GAggDaily from "./agg-line-chart-4g-agg-daily-v9";
import { get2G4GMetricConfigs } from "./metric-configs";

interface ChartsSectionProps {
  filteredData: Data2G4GModel[];
  chartLayout: number;
  setChartLayout: (layout: number) => void;
  aggregateBy: string;
  selectedKPIs: string[];
  onSelectedKPIsChange: (selected: string[]) => void;
}

export function ChartsSection4G({
  filteredData,
  chartLayout,
  aggregateBy,
  selectedKPIs,
  onSelectedKPIsChange,
}: ChartsSectionProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const getGridColumnsClass = () => {
    switch (chartLayout) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "md:grid-cols-2";
      case 3:
        return "md:grid-cols-2 lg:grid-cols-3";
      default:
        return "md:grid-cols-2";
    }
  };

  // Filter charts based on selected KPIs
  const visibleCharts = get2G4GMetricConfigs().filter(
    (chart) => chart.tech === "4G" && selectedKPIs.includes(chart.metric_num),
  );

  const toggleKPI = (metricNum: string) => {
    if (selectedKPIs.includes(metricNum)) {
      onSelectedKPIsChange(selectedKPIs.filter((id) => id !== metricNum));
    } else {
      onSelectedKPIsChange([...selectedKPIs, metricNum]);
    }
  };

  const selectAll = () => {
    onSelectedKPIsChange(
      get2G4GMetricConfigs()
        .filter((a) => a.tech === "4G")
        .map((config) => config.metric_num),
    );
  };

  const deselectAll = () => {
    onSelectedKPIsChange([]);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-gray-900 text-lg">Detailed Metrics</h2>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Customize KPIs ({selectedKPIs.length}/{get2G4GMetricConfigs().filter((a) => a.tech === "4G").length})
            </Button>
          </SheetTrigger>

          <SheetContent className="w-full overflow-y-auto p-4 sm:max-w-md">
            <SheetHeader className="mb-4">
              <SheetTitle>Select KPIs to Display</SheetTitle>
            </SheetHeader>

            <div className="mb-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll} className="flex-1">
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll} className="flex-1">
                Deselect All
              </Button>
            </div>

            <div className="space-y-2 pb-4">
              {get2G4GMetricConfigs()
                .filter((a) => a.tech === "4G")
                .map((config) => (
                  <label
                    key={config.metric_num}
                    className="flex cursor-pointer items-center rounded-lg border p-3 transition-colors hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedKPIs.includes(config.metric_num)}
                      onChange={() => toggleKPI(config.metric_num)}
                    />
                    <span className="ml-3 font-medium text-sm">{config.title}</span>
                  </label>
                ))}
            </div>

            <div className="sticky bottom-0 mt-2 border-t bg-white pt-4">
              <Button onClick={() => setIsSheetOpen(false)} className="w-full">
                Apply ({selectedKPIs.length} selected)
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className={`grid ${getGridColumnsClass()} gap-4`}>
        {visibleCharts.map((chart) => (
          <div
            key={chart.metric_num}
            className={`rounded-xl border bg-white p-2 shadow-sm ${chartLayout === 1 ? "w-full" : ""}`}
          >
            <LineChart4GAggDaily
              key={chart.metric_num}
              data={filteredData}
              metric_num={chart.metric_num}
              metric_denum={chart.metric_denum}
              title={chart.title}
              aggregation_by={aggregateBy}
              isExtractCellName={!!aggregateBy.includes("CELL")}
            />
          </div>
        ))}
      </div>

      {/* Show message if no KPIs selected */}
      {visibleCharts.length === 0 && (
        <div className="flex min-h-50 items-center justify-center rounded-lg border-2 border-gray-300 border-dashed">
          <div className="text-center">
            <p className="mb-2 text-gray-500">No KPIs selected</p>
            <Button variant="outline" size="sm" onClick={() => setIsSheetOpen(true)} className="gap-2">
              <Settings2 className="h-4 w-4" />
              Select KPIs to display
            </Button>
          </div>
        </div>
      )}

      {/* Mobile layout indicator */}
      <div className="mt-4 flex items-center justify-center sm:hidden">
        <div className="text-gray-500 text-xs">
          {chartLayout} column{chartLayout > 1 ? "s" : ""} layout
        </div>
      </div>
    </div>
  );
}

// components/charts-section.tsx
"use client";

import { useState } from "react";

import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";

import { ColumnLayoutToggle } from "./column-layout-toggle";
import LineChart4GAggDaily from "./line-chart-4g-agg-daily-v9";

interface ChartsSectionProps {
  filteredData: Data2G4GModel[];
  chartLayout: number;
  setChartLayout: (layout: number) => void;
  aggregateBy: string;
}

const CHART_CONFIGS = [
  { metric_num: "DL_PAYLOAD_GB", metric_denum: "DENUMBY1", title: "Total Payload (GB)" },
  { metric_num: "TRAFFIC_VOLTE_ERL", metric_denum: "DENUMBY1", title: "VoLTE Traffic (Erl)" },
  { metric_num: "AVG_MAX_NUMBER_RRC_CONNECTION_USER", metric_denum: "DENUMBY1", title: "Max RRC User" },
  { metric_num: "AVAILABILITY_NUM", metric_denum: "AVAILABILITY_DENUM", title: "Availability (%)" },
  {
    metric_num: "RRC_SETUP_SR_NUM",
    metric_denum: "RRC_SETUP_SR_DENUM",
    title: "RRC Setup Success Rate (%)",
  },
  {
    metric_num: "ERAB_SETUP_SR_NUM",
    metric_denum: "ERAB_SETUP_SR_DENUM",
    title: "E-RAB Setup Success Rate (%)",
  },
  { metric_num: "CSSR_NUM", metric_denum: "CSSR_DENUM", title: "Call Setup Success Rate (%)" },
  {
    metric_num: "SERVICE_DROP_RATE_NUM",
    metric_denum: "SERVICE_DROP_RATE_DENUM",
    title: "Service Drop Rate (%)",
  },
  {
    metric_num: "DL_PRB_UTILIZATION_NUM",
    metric_denum: "DL_PRB_UTILIZATION_DENUM",
    title: "DL PRB Utilization (%)",
  },
  {
    metric_num: "UL_PRB_UTILIZATION_NUM",
    metric_denum: "UL_PRB_UTILIZATION_DENUM",
    title: "UL PRB Utilization (%)",
  },
  { metric_num: "USER_DL_THP_NUM", metric_denum: "USER_DL_THP_DENUM", title: "User DL Throughput (Kbps)" },
  { metric_num: "USER_UL_THP_NUM", metric_denum: "USER_UL_THP_DENUM", title: "User UL Throughput (Kbps)" },
  { metric_num: "DL_RB_AVAILABLE", metric_denum: "DENUMBY1", title: "DL PRB Available" },
  { metric_num: "SE_NUM", metric_denum: "SE_DENUM", title: "SE" },
  { metric_num: "AVG_CQI_NUM", metric_denum: "AVG_CQI_DENUM", title: "CQI" },
  { metric_num: "AVG_NI_CARRIER_DBM", metric_denum: "DENUMBY1", title: "AVG NI of Carrier (dBm)" },
  { metric_num: "CSFB_SETUP_SR_NUM", metric_denum: "CSFB_SETUP_SR_DENUM", title: "CSFB Preparation (%)" },
  {
    metric_num: "CSFB_RELEASE_SR_NUM",
    metric_denum: "CSFB_RELEASE_SR_DENUM",
    title: "CSFB Release SR (%)",
  },
  { metric_num: "IFHO_SR_NUM", metric_denum: "IFHO_SR_DENUM", title: "Intra Freq LTE HO (%)" },
  { metric_num: "INTER_FHO_SR_NUM", metric_denum: "INTER_FHO_SR_DENUM", title: "Inter Freq LTE HO (%)" },
  { metric_num: "SRVCC_E2G_SR_NUM", metric_denum: "SRVCC_E2G_SR_DENUM", title: "SRVCC E2G SR (%)" },
  { metric_num: "SRVCC_E2W_SR_NUM", metric_denum: "SRVCC_E2W_SR_DENUM", title: "SRVCC E2W SR (%)" },
];

export function ChartsSection4G({ filteredData, chartLayout, setChartLayout, aggregateBy }: ChartsSectionProps) {
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>(
    // Default to all KPIs selected
    CHART_CONFIGS.map((chart) => chart.metric_num),
  );
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
  const visibleCharts = CHART_CONFIGS.filter((chart) => selectedKPIs.includes(chart.metric_num));

  const toggleKPI = (metricNum: string) => {
    if (selectedKPIs.includes(metricNum)) {
      setSelectedKPIs(selectedKPIs.filter((id) => id !== metricNum));
    } else {
      setSelectedKPIs([...selectedKPIs, metricNum]);
    }
  };

  const selectAll = () => {
    setSelectedKPIs(CHART_CONFIGS.map((config) => config.metric_num));
  };

  const deselectAll = () => {
    setSelectedKPIs([]);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-gray-900 text-lg">Detailed Metrics</h2>
          {/* <ColumnLayoutToggle chartLayout={chartLayout} onLayoutChange={setChartLayout} /> */}
        </div>

        {/* Sheet Trigger Button */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Customize KPIs ({selectedKPIs.length}/{CHART_CONFIGS.length})
            </Button>
          </SheetTrigger>

          {/* Sheet Content (Sidebar) */}
          <SheetContent className="w-full overflow-y-auto sm:max-w-md p-4">
            <SheetHeader className="mb-4">
              <SheetTitle>Select KPIs to Display</SheetTitle>
            </SheetHeader>

            {/* Selection Controls */}
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={selectAll} className="flex-1">
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll} className="flex-1">
                Deselect All
              </Button>
            </div>

            {/* KPI List */}
            <div className="space-y-2 pb-4">
              {CHART_CONFIGS.map((config) => (
                <label
                  key={config.metric_num}
                  className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedKPIs.includes(config.metric_num)}
                    onChange={() => toggleKPI(config.metric_num)}
                  />
                  <span className="ml-3 text-sm font-medium">{config.title}</span>
                </label>
              ))}
            </div>

            {/* Footer with selection count */}
            <div className="sticky bottom-0 bg-white border-t pt-4 mt-2">
              <Button onClick={() => setIsSheetOpen(false)} className="w-full">
                Apply ({selectedKPIs.length} selected)
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Chart Grid - Only shows selected KPIs */}
      <div className={`grid ${getGridColumnsClass()} gap-4`}>
        {visibleCharts.map((chart) => (
          <div
            key={chart.metric_num}
            className={`rounded-xl border bg-white p-4 shadow-sm ${chartLayout === 1 ? "mx-auto max-w-4xl" : ""}`}
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
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <p className="text-gray-500 mb-2">No KPIs selected</p>
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

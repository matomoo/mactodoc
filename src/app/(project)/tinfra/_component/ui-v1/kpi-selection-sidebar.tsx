// components/kpi-selection-sidebar.tsx
"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface KPISelectionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chartConfigs: Array<{ metric_num: string; title: string }>;
  selectedKPIs: string[];
  onSelectionChange: (selected: string[]) => void;
}

export function KPISelectionSidebar({
  isOpen,
  onClose,
  chartConfigs,
  selectedKPIs,
  onSelectionChange,
}: KPISelectionSidebarProps) {
  const toggleKPI = (metricNum: string) => {
    if (selectedKPIs.includes(metricNum)) {
      onSelectionChange(selectedKPIs.filter((id) => id !== metricNum));
    } else {
      onSelectionChange([...selectedKPIs, metricNum]);
    }
  };

  const selectAll = () => {
    onSelectionChange(chartConfigs.map((config) => config.metric_num));
  };

  const deselectAll = () => {
    onSelectionChange([]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close KPI selection"
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl transition-transform">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="font-semibold text-lg">Select KPIs to Display</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Selection Controls */}
          <div className="flex gap-2 border-b p-4">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Deselect All
            </Button>
          </div>

          {/* KPI List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {chartConfigs.map((config) => (
                <label
                  key={config.metric_num}
                  className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={selectedKPIs.includes(config.metric_num)}
                    onChange={() => toggleKPI(config.metric_num)}
                  />
                  <span className="ml-3 text-sm">{config.title}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <Button onClick={onClose} className="w-full">
              Apply ({selectedKPIs.length} selected)
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

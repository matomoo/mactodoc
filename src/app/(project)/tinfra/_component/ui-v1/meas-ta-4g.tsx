"use client";
// biome-ignore assist/source/organizeImports: <will fix later>
import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect, useMemo, useState } from "react";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from "chart.js";
import { ErrorState, NoDataState } from "./additional-component";
import { useFilterStore } from "@/stores/filterStore";
import { EnhancedLoadingState } from "./enhanced-loading-state";
import { chartJsV1Settings } from "../contexts/chartjs/chartjs-settings";

Chart.register(CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend);

interface AggCustomProps {
  area?: string;
  apiPath: string;
  aggregateBy?: string;
  filterLabel?: string;
  columnNumber?: number;
}

export default function MeasTa4G({ apiPath }: AggCustomProps) {
  const { dateRange2, filter, siteId, nop, kabupaten, batch } = useFilterStore();
  const shouldFetch = !!dateRange2 && dateRange2.includes("|") && siteId?.length === 6;
  const chartRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
  const chartInstances = useRef<{ [key: string]: Chart | null }>({});
  const [allSectors, setAllSectors] = useState<string[]>([]);

  const { isPending, error, data, isError } = useQuery({
    queryKey: ["meas-ta-4g", apiPath, dateRange2, filter, siteId, nop, kabupaten, batch],
    queryFn: async () => {
      if (!shouldFetch) {
        return { rows: [] };
      }
      const response = await fetch(
        `/tinfra/api/meas-db-ti-sul/${apiPath}?batch=${batch}&siteId=${siteId}&nop=${nop}&kabupaten=${kabupaten}&tgl_1=${dateRange2?.split("|")[0]}&tgl_2=${dateRange2?.split("|")[1]}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (data?.rows) {
      const uniqueSectors: string[] = Array.from(new Set(data.rows.map((row: any) => row.sector))).sort() as string[];
      setAllSectors(uniqueSectors);
    }
  }, [data]);

  // Process chart data for each sector - moved before conditional returns
  const getChartDataForSector = useMemo(() => {
    return (sector: string) => {
      if (!data?.rows || data.rows.length === 0) {
        return { labels: [], datasets: [] };
      }

      // Filter data by sector
      const sectorData = data.rows.filter((row: any) => row.sector === sector);

      // Group by cellId and organize by ta_range
      const cellGroups: Record<string, Record<string, number>> = {};
      const allTaRanges = new Set<string>();
      const sortOrderMap: Record<string, number> = {};

      sectorData.forEach((row: any) => {
        const cellId = row.cellId || "Unknown";
        const taRange = row.ta_range || "Unknown";
        const totalReport = Number(row.total_reports) || 0;
        const sortOrder = row.sort_order || 0;

        // Initialize cell group if not exists
        if (!cellGroups[cellId]) {
          cellGroups[cellId] = {};
        }

        // Add to cell group
        cellGroups[cellId][taRange] = totalReport;

        // Track all TA ranges and sort orders
        allTaRanges.add(taRange);
        sortOrderMap[taRange] = sortOrder;
      });

      // Sort TA ranges by sort_order
      const sortedTaRanges = Array.from(allTaRanges).sort((a, b) => (sortOrderMap[a] ?? 0) - (sortOrderMap[b] ?? 0));

      // Create datasets for each cell
      const colors = [
        "rgba(54, 162, 235, 0.6)", // Blue
        "rgba(255, 99, 132, 0.6)", // Red
        "rgba(75, 192, 192, 0.6)", // Green
        "rgba(255, 205, 86, 0.6)", // Yellow
        "rgba(153, 102, 255, 0.6)", // Purple
        "rgba(255, 159, 64, 0.6)", // Orange
      ];

      const borderColors = [
        "rgba(54, 162, 235, 1)",
        "rgba(255, 99, 132, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(255, 205, 86, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ];

      const datasets = Object.keys(cellGroups).map((cellId, index) => ({
        label: `${cellId}`,
        data: sortedTaRanges.map((taRange) => cellGroups[cellId][taRange] || 0),
        backgroundColor: colors[index % colors.length],
        borderColor: borderColors[index % borderColors.length],
        borderWidth: 1,
      }));

      return {
        labels: sortedTaRanges,
        datasets,
      };
    };
  }, [data]);

  useEffect(() => {
    Object.keys(chartInstances.current).forEach((sector) => {
      if (chartInstances.current[sector]) {
        chartInstances.current[sector]?.destroy();
        chartInstances.current[sector] = null;
      }
    });

    allSectors.forEach((sector) => {
      const chartRef = chartRefs.current[sector];
      if (!chartRef) return;

      const ctx = chartRef.getContext("2d");
      if (!ctx) return;

      const chartData = getChartDataForSector(sector);
      if (!chartData.labels.length) return;

      const config: ChartConfiguration<"bar"> = {
        type: "bar",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              display: false,
            },
            legend: {
              position: "top" as const,
              labels: {
                usePointStyle: true,
                font: {
                  size: chartJsV1Settings.legendFontSize,
                  family: chartJsV1Settings.legendFontFamily,
                  weight: chartJsV1Settings.legendFontWeight,
                },
              },
            },
            title: {
              display: true,
              text: `TA Sector ${sector}`,
              font: {
                size: chartJsV1Settings.titleFontSize,
                // family: chartJsV1Settings.titleFontFamily,
                weight: chartJsV1Settings.titleFontWeight,
              },
            },
            tooltip: {
              backgroundColor: chartJsV1Settings.tooltipBackgroundColor,
              titleFont: {
                size: chartJsV1Settings.tooltipTitleFontSize,
              },
              bodyFont: {
                size: chartJsV1Settings.tooltipBodyFontSize,
              },
            },
          },
          scales: {
            x: {
              title: {
                display: false,
                text: "TA Attempt",
                font: {
                  size: chartJsV1Settings.xAxisTitleFontSize,
                  family: chartJsV1Settings.xAxisTitle,
                },
              },
              ticks: {
                font: {
                  size: chartJsV1Settings.xAxisTickFontSize,
                  family: chartJsV1Settings.xAxisTick,
                },
                maxRotation: 90,
                minRotation: 90,
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: false,
                text: "TA Attempt",
                font: {
                  size: chartJsV1Settings.yAxisTitleFontSize,
                  family: chartJsV1Settings.yAxisTitle,
                  weight: chartJsV1Settings.yAxisTitleFontWeight,
                },
              },
              ticks: {
                font: {
                  size: chartJsV1Settings.yAxisTickFontSize,
                  family: chartJsV1Settings.yAxisTick,
                },
              },
            },
          },
        },
      };

      chartInstances.current[sector] = new Chart(ctx, config);
    });

    return () => {
      Object.keys(chartInstances.current).forEach((sector) => {
        if (chartInstances.current[sector]) {
          chartInstances.current[sector]?.destroy();
          chartInstances.current[sector] = null;
        }
      });
    };
  }, [allSectors, getChartDataForSector]);

  if (isPending) return <EnhancedLoadingState />;
  if (isError) return <ErrorState message={error.message} />;
  if (!shouldFetch) return <NoDataState message="Please select a date range to view data" />;
  if (!data?.rows || data.rows.length === 0) {
    return (
      <NoDataState message="No data available for the selected criteria. For demo purposes, available site ID is NBW001, NBW002, NBW003, NBW004, NBW005" />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-full overflow-hidden overflow-x-hidden rounded-xl border bg-white p-4 shadow-sm lg:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Chart Section */}
          {allSectors.map((sector: string, _index: number) => (
            <div key={sector} className="mb-6 lg:col-span-12">
              <div className="rounded-md border p-4">
                <div className="h-96">
                  <canvas
                    ref={(el) => {
                      chartRefs.current[sector] = el;
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";
// biome-ignore assist/source/organizeImports: <will fix later>
import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect, useMemo, useState } from "react";
import {
  Chart,
  type ChartConfiguration,
  type ChartDataset,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ErrorState, NoDataState } from "./additional-component";
import { useFilterStore } from "@/stores/filterStore";
import { EnhancedLoadingState } from "./enhanced-loading-state";
import { chartJsV1Settings } from "../contexts/chartjs/chartjs-settings";

Chart.register(CategoryScale, LinearScale, BarController, BarElement, Title, Tooltip, Legend);

export interface MeasTa4GData {
  rows: {
    siteid_cellid: string;
    sector: string;
    ta_range: string;
    sort_order: number;
    total_reports: number;
  }[];
}

interface AggCustomProps {
  area?: string;
  apiPath: string;
  aggregateBy?: string;
  filterLabel?: string;
  columnNumber?: number;
}

export default function MeasTa4G({ apiPath }: AggCustomProps) {
  const { dateRange2, filter, siteId, nop, kabupaten, batch } = useFilterStore();
  const shouldFetch = Boolean(
    dateRange2?.includes("|") && siteId && siteId.trim().length > 0 && siteId !== "---" && siteId !== "All",
  );
  const chartRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
  const chartInstances = useRef<{ [key: string]: Chart | null }>({});
  const [allSites, setAllSites] = useState<string[]>([]);

  const { isPending, error, data, isError } = useQuery<MeasTa4GData>({
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

  // console.log(data);

  useEffect(() => {
    if (data?.rows) {
      const uniqueSites: string[] = Array.from(
        // biome-ignore lint/suspicious/noExplicitAny: <none>
        new Set(data.rows.map((row: any) => row.siteid)),
      ).sort() as string[];
      setAllSites(uniqueSites);
    }
  }, [data]);

  // Process chart data for each site ID - moved before conditional returns
  const getChartDataForSite = useMemo(() => {
    return (siteId: string) => {
      if (!data?.rows || data.rows.length === 0) {
        return { labels: [], datasets: [] };
      }

      // Filter data by site ID
      // biome-ignore lint/suspicious/noExplicitAny: <none>
      const siteData = data.rows.filter((row: any) => row.siteid === siteId);

      // Group by sector first, then by cell ID within each sector
      const sectorGroups: Record<string, Record<string, Record<string, number>>> = {};
      const allTaRanges = new Set<string>();
      const sortOrderMap: Record<string, number> = {};

      // biome-ignore lint/suspicious/noExplicitAny: <none>
      siteData.forEach((row: any) => {
        const sector = row.sector || "Unknown";
        const cellId = row.cellId || "Unknown";
        const taRange = row.ta_range || "Unknown";
        const totalReport = Number(row.total_reports) || 0;
        const sortOrder = row.sort_order || 0;

        // Initialize sector group if not exists
        if (!sectorGroups[sector]) {
          sectorGroups[sector] = {};
        }

        // Initialize cell group within sector if not exists
        if (!sectorGroups[sector][cellId]) {
          sectorGroups[sector][cellId] = {};
        }

        // Add to cell group
        sectorGroups[sector][cellId][taRange] = totalReport;

        // Track all TA ranges and sort orders
        allTaRanges.add(taRange);
        sortOrderMap[taRange] = sortOrder;
      });

      // Sort TA ranges by sort_order
      const sortedTaRanges = Array.from(allTaRanges).sort((a, b) => (sortOrderMap[a] ?? 0) - (sortOrderMap[b] ?? 0));

      // Create datasets for each cell within each sector
      const colors = [
        "rgba(54, 162, 235, 0.6)", // Blue
        "rgba(255, 99, 132, 0.6)", // Red
        "rgba(75, 192, 192, 0.6)", // Green
        "rgba(255, 205, 86, 0.6)", // Yellow
        "rgba(153, 102, 255, 0.6)", // Purple
        "rgba(255, 159, 64, 0.6)", // Orange
        "rgba(231, 76, 60, 0.6)", // Red Orange
        "rgba(46, 204, 113, 0.6)", // Emerald
        "rgba(155, 89, 182, 0.6)", // Amethyst
        "rgba(52, 152, 219, 0.6)", // Peter River
      ];

      const borderColors = [
        "rgba(54, 162, 235, 1)",
        "rgba(255, 99, 132, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(255, 205, 86, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
        "rgba(231, 76, 60, 1)",
        "rgba(46, 204, 113, 1)",
        "rgba(155, 89, 182, 1)",
        "rgba(52, 152, 219, 1)",
      ];

      // Create datasets for each sector (containing all cells within that sector)
      const datasets: Record<string, ChartDataset<"bar">[]> = {};

      Object.keys(sectorGroups).forEach((sector) => {
        datasets[sector] = Object.keys(sectorGroups[sector]).map((cellId, index) => ({
          label: `${cellId}`,
          data: sortedTaRanges.map((taRange) => sectorGroups[sector][cellId][taRange] || 0),
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 1,
        }));
      });

      return {
        labels: sortedTaRanges,
        datasets,
      };
    };
  }, [data]);

  useEffect(() => {
    Object.keys(chartInstances.current).forEach((key) => {
      if (chartInstances.current[key]) {
        chartInstances.current[key]?.destroy();
        chartInstances.current[key] = null;
      }
    });

    allSites.forEach((siteId: string) => {
      // Get chart data for this site
      const siteChartData = getChartDataForSite(siteId);
      if (!siteChartData.labels.length) return;

      // Create a chart for each sector in this site (excluding sector 0)
      Object.keys(siteChartData.datasets)
        .filter((sector) => sector !== "0")
        .forEach((sector) => {
          const chartKey = `${siteId}-${sector}`;
          const chartRef = chartRefs.current[chartKey];
          if (!chartRef) return;

          const ctx = chartRef.getContext("2d");
          if (!ctx) return;

          // Create chart data for this specific sector (all cells within sector)
          const sectorDatasets = (siteChartData.datasets as Record<string, ChartDataset<"bar">[]>)[sector] || [];
          const chartDataForSector = {
            labels: siteChartData.labels,
            datasets: sectorDatasets,
          };

          const config: ChartConfiguration<"bar"> = {
            type: "bar",
            data: chartDataForSector,
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
                  text: `TA Site ${siteId} - Sector ${sector}`,
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

          chartInstances.current[chartKey] = new Chart(ctx, config);
        });
    });

    return () => {
      Object.keys(chartInstances.current).forEach((key) => {
        if (chartInstances.current[key]) {
          chartInstances.current[key]?.destroy();
          chartInstances.current[key] = null;
        }
      });
    };
  }, [allSites, getChartDataForSite]);

  if (isPending) return <EnhancedLoadingState />;
  if (isError) return <ErrorState message={error.message} />;
  if (!shouldFetch) return <NoDataState message="Please select a date range to view data" />;
  if (!data?.rows || data.rows.length === 0) {
    return <NoDataState message="No data available for the selected criteria." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-full overflow-hidden overflow-x-hidden rounded-xl border bg-white p-4 shadow-sm lg:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Chart Section */}
          {allSites.map((siteId: string) => (
            <div key={siteId} className="mb-8 lg:col-span-12">
              <div className="rounded-lg border bg-gray-50 p-4">
                <h3 className="mb-4 text-center font-semibold text-lg">TA Site {siteId}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-1">
                  {(() => {
                    const siteChartData = getChartDataForSite(siteId);
                    return Object.keys(siteChartData.datasets)
                      .filter((sector) => sector !== "0")
                      .map((sector) => (
                        <div key={`${siteId}-${sector}`} className="rounded-md border bg-white p-4">
                          {/* <h4 className="mb-2 text-center font-medium text-md">
                            Sector {sector}
                          </h4> */}
                          <div className="h-96">
                            <canvas
                              ref={(el) => {
                                chartRefs.current[`${siteId}-${sector}`] = el;
                              }}
                            />
                          </div>
                        </div>
                      ));
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

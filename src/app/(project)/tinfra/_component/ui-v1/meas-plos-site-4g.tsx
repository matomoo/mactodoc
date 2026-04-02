"use client";
// biome-ignore assist/source/organizeImports: <will fix later>
import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect, useMemo, useState } from "react";
import {
  Chart,
  type ChartConfiguration,
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

interface MeasPlos4GData {
  rows: {
    "Begin Time": string;
    siteid: string;
    nop: string;
    "Avg Packet Loss Rate": number;
    Remark: string;
  }[];
}

interface AggCustomProps {
  area?: string;
  apiPath: string;
  aggregateBy?: string;
  filterLabel?: string;
  columnNumber?: number;
}

export default function MeasPlosSite4G({ apiPath }: AggCustomProps) {
  const { dateRange2, filter, siteId, nop, kabupaten, batch } = useFilterStore();
  const shouldFetch = Boolean(
    dateRange2?.includes("|") && siteId && siteId.trim().length > 0 && siteId !== "---" && siteId !== "All",
  );
  const chartRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
  const chartInstances = useRef<{ [key: string]: Chart | null }>({});
  const [allSites, setAllSites] = useState<string[]>([]);

  const { isPending, error, data, isError } = useQuery<MeasPlos4GData>({
    queryKey: ["meas-plos-site-4g", apiPath, dateRange2, filter, siteId, nop, kabupaten, batch],
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

  console.log(data);

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

      // Group by date and organize by Avg Packet Loss Rate and Remark
      const dateGroups: Record<string, { packetLoss: number; remark: string }> = {};
      const allDates = new Set<string>();
      const remarkCounts: Record<string, number> = { PASS: 0, FAIL: 0 };

      // biome-ignore lint/suspicious/noExplicitAny: <none>
      siteData.forEach((row: any) => {
        const beginTime = row["Begin Time"] || "Unknown";
        const avgPacketLossRate = Number(row["Avg Packet Loss Rate"]) || 0;
        const remark = row.Remark || "Unknown";

        // Add to date group
        dateGroups[beginTime] = {
          packetLoss: avgPacketLossRate,
          remark: remark,
        };

        // Track all dates and remark counts
        allDates.add(beginTime);
        if (remark in remarkCounts) {
          remarkCounts[remark]++;
        }
      });

      // Sort dates
      const sortedDates = Array.from(allDates).sort();

      // Create datasets for dual-axis chart
      const datasets = [
        {
          label: "Avg Packet Loss Rate",
          data: sortedDates.map((date) => dateGroups[date]?.packetLoss || 0),
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.1)",
          borderWidth: 2,
          type: "line" as const,
          yAxisID: "y",
          tension: 0.1,
        },
        {
          label: "FAIL Count",
          data: sortedDates.map((date) => (dateGroups[date]?.remark === "FAIL" ? 1 : 0)),
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
          type: "bar" as const,
          yAxisID: "y1",
        },
        // {
        //   label: "PASS Count",
        //   data: sortedDates.map((date) =>
        //     dateGroups[date]?.remark === "PASS" ? 0 : 0,
        //   ),
        //   backgroundColor: "rgba(75, 192, 192, 0.6)",
        //   borderColor: "rgba(75, 192, 192, 1)",
        //   borderWidth: 1,
        //   type: "bar" as const,
        //   yAxisID: "y1",
        // },
      ];

      return {
        labels: sortedDates.map((date) => {
          // Format date to display only date part
          const dateObj = new Date(date);
          return dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }),
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

      const chartKey = `${siteId}-ploss`;
      const chartRef = chartRefs.current[chartKey];
      if (!chartRef) return;

      const ctx = chartRef.getContext("2d");
      if (!ctx) return;

      const config: ChartConfiguration<"bar" | "line"> = {
        type: "bar",
        // biome-ignore lint/suspicious/noExplicitAny: <none>
        data: siteChartData as any,
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
              text: `Packet Loss Rate - Site ${siteId}`,
              font: {
                size: chartJsV1Settings.titleFontSize,
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
              callbacks: {
                label: (context) => {
                  if (context.dataset.label === "Avg Packet Loss Rate") {
                    return `${context.dataset.label}: ${context.parsed.y?.toFixed(2) ?? 0}%`;
                  }
                  return `${context.dataset.label}: ${context.parsed.y}`;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Date",
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
              },
            },
            y: {
              type: "linear" as const,
              display: true,
              position: "left" as const,
              beginAtZero: true,
              title: {
                display: true,
                text: "Packet Loss Rate (%)",
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
                callback: (value) => {
                  return `${value}%`;
                },
              },
            },
            y1: {
              type: "linear" as const,
              display: true,
              position: "right" as const,
              beginAtZero: true,
              title: {
                display: true,
                text: "Remark Count",
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
                stepSize: 1,
              },
              grid: {
                drawOnChartArea: false,
              },
            },
          },
        },
      };

      chartInstances.current[chartKey] = new Chart(ctx, config);
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
                <h3 className="mb-4 text-center font-semibold text-lg">Packet Loss - Site {siteId}</h3>
                <div className="rounded-md border bg-white p-4">
                  <div className="h-96">
                    <canvas
                      ref={(el) => {
                        chartRefs.current[`${siteId}-ploss`] = el;
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

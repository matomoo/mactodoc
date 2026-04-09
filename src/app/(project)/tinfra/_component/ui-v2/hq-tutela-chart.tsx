"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  CategoryScale,
  Chart,
  type ChartConfiguration,
  Legend,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
} from "chart.js";

import { WeekRangeSelect } from "@/components/ui/week-range-select";
import { useFilterStore } from "@/stores/filterStore";

import { chartJsV1Settings } from "../contexts/chartjs/chartjs-settings";
import { ErrorState, NoDataState } from "../ui-v1/additional-component";
import { EnhancedLoadingState } from "../ui-v1/enhanced-loading-state";
import KPIChartDetail from "./hq-tutela-chart-detail";

Chart.register(CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend);

interface MeasPlos4GData {
  rows: {
    location: string;
    year_week: number;
    Lose: string;
    Win: string;
    target_kpi: string;
  }[];
}

interface ChartDataSet {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  borderWidth?: number;
  type?: "bar" | "line";
  yAxisID?: string;
  stack?: string;
  borderDash?: number[];
  datalabels?: {
    display: boolean;
  };
  tension?: number;
}

interface KabupatenChartData {
  labels: string[];
  datasets: ChartDataSet[];
}

interface ChartData {
  labels: string[];
  datasets: ChartDataSet[];
  weekRange: [number, number];
  kabupatenData: { [key: string]: KabupatenChartData };
  isMultiValues: boolean;
}

interface AggCustomProps {
  labels?: string[];
  loseData?: number[];
  winData?: number[];
  targetKPIData?: number[];
  apiPath: string;
  fieldToAggregate: string;
  tutelaProvider: string;
  tutelaLevel: string;
}

export default function KPIChart({ apiPath, fieldToAggregate, tutelaProvider, tutelaLevel }: AggCustomProps) {
  const { dateRange2, filter, siteId, nop, kabupaten, batch, kecamatan, region, weekRange, setWeekRange } =
    useFilterStore();
  // Get the appropriate filter value based on fieldToAggregate
  const filterValue = fieldToAggregate === "region" ? region : fieldToAggregate === "kabupaten" ? kabupaten : siteId;

  // console.log(apiPath);
  // console.log(fieldToAggregate);

  const shouldFetch = Boolean(
    dateRange2?.includes("|") &&
      filterValue &&
      filterValue.trim().length > 0 &&
      filterValue !== "---" &&
      filterValue !== "All",
  );
  const chartRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
  const chartInstances = useRef<{ [key: string]: Chart | null }>({});
  const [allSites, setAllSites] = useState<string[]>([]);

  // Debug logging for troubleshooting
  console.log("Debug - Filter values - hq-tutela-chart:", {
    dateRange2,
    filterValue,
    fieldToAggregate,
    region,
    kabupaten,
    siteId,
    shouldFetch,
    weekRange,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    localStorage: localStorage.getItem("filter-storage"),
  });

  const { isPending, error, data, isError } = useQuery<MeasPlos4GData>({
    queryKey: [
      "hq-tutela",
      apiPath,
      dateRange2,
      filter,
      siteId,
      nop,
      kabupaten,
      batch,
      region,
      tutelaProvider,
      tutelaLevel,
      shouldFetch, // Add shouldFetch to queryKey to ensure re-fetch when it changes
    ],
    queryFn: async () => {
      if (!shouldFetch) {
        return { rows: [] };
      }
      const response = await fetch(
        [
          `/tinfra/api/meas-db-ti-sul/${apiPath}?fieldToAggregate=${fieldToAggregate}`,
          `batch=${batch}`,
          `siteId=${siteId}`,
          `nop=${nop}`,
          `kabupaten=${kabupaten}`,
          `kecamatan=${kecamatan}`,
          `region=${region}`,
          `provider=${tutelaProvider}`,
          `level=${tutelaLevel}`,
          `tgl_1=${dateRange2?.split("|")[0]}`,
          `tgl_2=${dateRange2?.split("|")[1]}`,
        ].join("&"),
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
        new Set(data.rows.map((row: any) => row.location)),
      ).sort() as string[];
      setAllSites(uniqueSites);
    }
  }, [data]);

  // Process chart data - moved before conditional returns
  const getChartData = useMemo((): ChartData => {
    if (!data?.rows || data.rows.length === 0) {
      return {
        labels: [],
        datasets: [],
        weekRange: [202601, 202652],
        kabupatenData: {},
        isMultiValues: false,
      };
    }

    // Get min and max week from data and normalize
    const weeks = data.rows.map((row) => row.year_week);
    const minWeek = Math.min(...weeks);
    const maxWeek = Math.max(...weeks);

    // Normalize week range - if week 53 exists, start from week 1 of that year
    const minWeekYear = Math.floor(minWeek / 100);
    const minWeekNum = minWeek % 100;
    const normalizedMinWeek = minWeekNum === 53 ? (minWeekYear + 1) * 100 + 1 : minWeek;

    // Filter data by week range
    const filteredData = data.rows.filter((row) => row.year_week >= weekRange[0] && row.year_week <= weekRange[1]);
    // console.log("filteredData", filteredData);

    // Check if multiple kabupaten are selected
    const selectedKabupatenValues =
      filterValue
        ?.split(",")
        .map((k) => k.trim())
        .filter((k) => k && k !== "---" && k !== "All") || [];
    const isMultiValues = selectedKabupatenValues.length > 1;

    // Group data by kabupaten (unified approach for both single and multi)
    const valueGroups: { [key: string]: any[] } = {};

    if (isMultiValues) {
      // Multiple kabupaten: group by location
      filteredData.forEach((row) => {
        const location = row.location || "Unknown";
        if (!valueGroups[location]) {
          valueGroups[location] = [];
        }
        valueGroups[location].push(row);
      });
    } else {
      // Single kabupaten: use the selected kabupaten as key
      if (filterValue && filterValue !== "---" && filterValue !== "All") {
        valueGroups[filterValue] = filteredData;
      } else {
        valueGroups.Default = filteredData;
      }
    }

    // Process each kabupaten data (unified logic)
    const kabupatenData: { [key: string]: any } = {};
    const allLabels = [...new Set(filteredData.map((row) => `Week ${row.year_week}`))].sort();

    Object.keys(valueGroups).forEach((kab) => {
      const kabData = valueGroups[kab];
      const sortedKabData = [...kabData].sort((a, b) => a.year_week - b.year_week);

      kabupatenData[kab] = {
        labels: allLabels,
        datasets: [
          {
            label: `${kab} - Lose`,
            data: allLabels.map((label) => {
              const weekNum = parseInt(label.replace("Week ", ""), 10);
              const row = sortedKabData.find((r) => r.year_week === weekNum);
              return row ? Number(row.Lose) || 0 : 0;
            }),
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderWidth: 2,
            type: "bar" as const,
            yAxisID: "y",
            stack: `${kab}-stack1`,
            datalabels: { display: true },
          },
          {
            label: `${kab} - Win`,
            data: allLabels.map((label) => {
              const weekNum = parseInt(label.replace("Week ", ""), 10);
              const row = sortedKabData.find((r) => r.year_week === weekNum);
              return row ? Number(row.Win) || 0 : 0;
            }),
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderWidth: 2,
            type: "bar" as const,
            yAxisID: "y",
            stack: `${kab}-stack1`,
            datalabels: { display: true },
          },
          {
            label: `${kab} - Target KPI`,
            data: allLabels.map((label) => {
              const weekNum = parseInt(label.replace("Week ", ""), 10);
              const row = sortedKabData.find((r) => r.year_week === weekNum);
              return row ? Number(row.target_kpi) || 0 : 0;
            }),
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.1)",
            borderWidth: 2,
            type: "line" as const,
            yAxisID: "y",
            borderDash: [5, 5],
            tension: 0.1,
            datalabels: { display: false },
          },
        ],
      };
    });

    return {
      labels: allLabels,
      datasets: [],
      weekRange: [normalizedMinWeek, maxWeek],
      kabupatenData,
      isMultiValues,
    };
  }, [data, weekRange, filterValue?.split, filterValue]);

  // Unified chart configuration function
  const createChartConfig = useCallback((data: any, title: string): ChartConfiguration => {
    return {
      type: "bar",
      data: data,
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
            text: title,
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
          },
        },
        scales: {
          x: {
            title: {
              display: false,
              text: "Week",
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
            stacked: true,
            title: {
              display: false,
              text: "Count",
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
  }, []);

  useEffect(() => {
    // Clean up existing charts
    Object.keys(chartInstances.current).forEach((key) => {
      if (chartInstances.current[key]) {
        chartInstances.current[key]?.destroy();
        chartInstances.current[key] = null;
      }
    });

    const chartData = getChartData;
    if (!chartData.labels.length) return;

    // Unified chart creation - iterate through all kabupaten data
    Object.keys(chartData.kabupatenData).forEach((kabupaten) => {
      const kabData = chartData.kabupatenData[kabupaten];
      const chartKey = `hq-tutela-${kabupaten}`;
      const chartRef = chartRefs.current[chartKey];
      if (!chartRef) return;

      const ctx = chartRef.getContext("2d");
      if (!ctx) return;

      const config = createChartConfig(kabData, `TUTELA - ${fieldToAggregate.toUpperCase()} ${kabupaten}`);
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
  }, [getChartData, fieldToAggregate, createChartConfig]);

  if (!shouldFetch) return <NoDataState message="Please select a date range to view data" />;
  if (isPending) return <EnhancedLoadingState />;
  if (isError) return <ErrorState message={error.message} />;
  if (!data?.rows || data.rows.length === 0) {
    return <NoDataState message="No data available for the selected criteria." />;
  }

  // Get week range from data or fallback to 2026
  const sliderMin = getChartData.weekRange[0] || 202601;
  const sliderMax = getChartData.weekRange[1] || 202652;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-full overflow-hidden overflow-x-hidden rounded-xl border bg-white p-4 shadow-sm lg:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Week Range Select Section */}
          <div className="mb-6 lg:col-span-12">
            <div className="rounded-md border bg-white p-4">
              <div className="mb-4">
                <h3 className="mb-4 font-semibold text-gray-800 text-lg">Select Week Range</h3>
                <WeekRangeSelect
                  initialWeekRange={weekRange}
                  onWeekRangeChange={(newWeekRange) => {
                    setWeekRange(newWeekRange);
                  }}
                  minWeek={sliderMin}
                  maxWeek={sliderMax}
                  availableWeeks={data?.rows?.map((row) => row.year_week)}
                />
              </div>
            </div>
          </div>
          {/* Chart Section */}
          <div className="mb-8 grid grid-cols-1 gap-4 lg:col-span-12 lg:grid-cols-1 xl:grid-cols-1">
            {/* Unified chart rendering - works for both single and multiple kabupaten */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-1 xl:grid-cols-1">
              {Object.keys(getChartData.kabupatenData).map((kabupaten) => {
                return (
                  <div key={kabupaten} className="rounded-md border bg-white p-4">
                    <div className="h-80">
                      <canvas
                        ref={(el) => {
                          chartRefs.current[`hq-tutela-${kabupaten}`] = el;
                        }}
                      />
                    </div>
                    <KPIChartDetail
                      apiPath={"aggregate/hq-tutela/by-metric"}
                      fieldToAggregate={fieldToAggregate}
                      provider={"All"}
                      level={tutelaLevel}
                      location={filterValue || "kabupaten"}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

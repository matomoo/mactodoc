"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  CategoryScale,
  Chart,
  type ChartConfiguration,
  type ChartOptions,
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

Chart.register(CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend);

interface MeasPlos4GData {
  rows: {
    yearweek: number;
    fail2g: string;
    good2g: string;
    total2g: string;
    fail4g: string;
    good4g: string;
    total4g: string;
    fail5g: string;
    good5g: string;
    total5g: string;
    totalfail: string;
    totalgood: string;
    totalall: string;
    percent_rhi_all: string;
    target_rhi: string;
    rhiLevel?: string;
    rhiProvider?: string;
    [key: string]: string | number | undefined;
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
  rhiProvider: string;
  rhiLevel: string;
}

export default function KPIChart({ apiPath, fieldToAggregate, rhiProvider, rhiLevel }: AggCustomProps) {
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

  const { isPending, error, data, isError } = useQuery<MeasPlos4GData>({
    queryKey: ["hq-rhi", apiPath, dateRange2, filter, siteId, nop, kabupaten, batch, region, rhiProvider, rhiLevel],
    queryFn: async () => {
      if (!shouldFetch) {
        return { rows: [] };
      }
      const response = await fetch(
        [
          `/tinfra/api/meas-db-ti-sul/${apiPath}?fieldToAggregate=${fieldToAggregate}`,
          `batch=${batch}`,
          `site_id=${siteId}`,
          `nop=${nop}`,
          `kabupaten=${kabupaten}`,
          `kecamatan=${kecamatan}`,
          `region=${region}`,
          `provider=${rhiProvider}`,
          `level=${rhiLevel}`,
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

  console.log("data", data);

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
    const weeks = data.rows.map((row) => row.yearweek);
    const minWeek = Math.min(...weeks);
    const maxWeek = Math.max(...weeks);

    // Normalize week range - if week 53 exists, start from week 1 of that year
    const minWeekYear = Math.floor(minWeek / 100);
    const minWeekNum = minWeek % 100;
    const normalizedMinWeek = minWeekNum === 53 ? (minWeekYear + 1) * 100 + 1 : minWeek;

    // Filter data by week range
    const filteredData = data.rows.filter((row) => row.yearweek >= weekRange[0] && row.yearweek <= weekRange[1]);
    // console.log("filteredData", filteredData);

    // Check if multiple kabupaten are selected
    const selectedKabupatenValues =
      filterValue
        ?.split(",")
        .map((k) => k.trim())
        .filter((k) => k && k !== "---" && k !== "All") || [];
    const isMultiValues = selectedKabupatenValues.length > 1;
    console.log(isMultiValues);

    // Group data by kabupaten (unified approach for both single and multi)
    // biome-ignore lint/suspicious/noExplicitAny: <none>
    const valueGroups: { [key: string]: any[] } = {};

    if (isMultiValues) {
      // Multiple kabupaten: group by kabupaten - filter data for each specific kabupaten
      selectedKabupatenValues.forEach((kabValue) => {
        const kabSpecificData = filteredData.filter((row) => {
          const rowKabupaten = row[fieldToAggregate];
          return rowKabupaten === kabValue;
        });
        valueGroups[kabValue] = kabSpecificData;
      });
      console.log("selectedKabupatenValues", selectedKabupatenValues);
    } else {
      // Single selection: use the filterValue as key (supports region, kabupaten, or siteId)
      if (filterValue && filterValue !== "---" && filterValue !== "All") {
        valueGroups[filterValue] = filteredData;
      } else {
        valueGroups.Default = filteredData;
      }
    }

    // Process each kabupaten data (unified logic)
    // biome-ignore lint/suspicious/noExplicitAny: <none>
    const kabupatenData: { [key: string]: any } = {};
    const allLabels = [...new Set(filteredData.map((row) => `Week ${row.yearweek}`))].sort();

    Object.keys(valueGroups).forEach((kab) => {
      const kabData = valueGroups[kab];
      const sortedKabData = [...kabData].sort((a, b) => a.yearweek - b.yearweek);

      kabupatenData[kab] = {
        labels: allLabels,
        datasets: [
          {
            label: `Fail 2G`,
            data: allLabels.map((label) => {
              const weekNum = parseInt(label.replace("Week ", ""), 10);
              const row = sortedKabData.find((r) => r.yearweek === weekNum);
              return row ? Number(row.fail2g) || 0 : 0;
            }),
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderWidth: 2,
            type: "bar" as const,
            yAxisID: "y",
            stack: `${kab}-stack`,
            datalabels: { display: true },
          },
          {
            label: `Fail 4G`,
            data: allLabels.map((label) => {
              const weekNum = parseInt(label.replace("Week ", ""), 10);
              const row = sortedKabData.find((r) => r.yearweek === weekNum);
              return row ? Number(row.fail4g) || 0 : 0;
            }),
            borderColor: "rgba(255, 159, 64, 1)",
            backgroundColor: "rgba(255, 159, 64, 0.6)",
            borderWidth: 2,
            type: "bar" as const,
            yAxisID: "y",
            stack: `${kab}-stack`,
            datalabels: { display: true },
          },
          {
            label: `Fail 5G`,
            data: allLabels.map((label) => {
              const weekNum = parseInt(label.replace("Week ", ""), 10);
              const row = sortedKabData.find((r) => r.yearweek === weekNum);
              return row ? Number(row.fail5g) || 0 : 0;
            }),
            borderColor: "rgba(255, 205, 86, 1)",
            backgroundColor: "rgba(255, 205, 86, 0.6)",
            borderWidth: 2,
            type: "bar" as const,
            yAxisID: "y",
            stack: `${kab}-stack`,
            datalabels: { display: true },
          },
          {
            label: `RHI All (%)`,
            data: allLabels.map((label) => {
              const weekNum = parseInt(label.replace("Week ", ""), 10);
              const row = sortedKabData.find((r) => r.yearweek === weekNum);
              return row ? Number(row.percent_rhi_all) || 0 : 0;
            }),
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.1)",
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 0,
            type: "line" as const,
            yAxisID: "y1",
            tension: 0.3,
            datalabels: { display: false },
          },
          {
            label: `Target RHI (%)`,
            data: allLabels.map((label) => {
              const weekNum = parseInt(label.replace("Week ", ""), 10);
              const row = sortedKabData.find((r) => r.yearweek === weekNum);
              return row ? Number(row.target_rhi) || 0 : 0;
            }),
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.1)",
            borderWidth: 2,
            type: "line" as const,
            yAxisID: "y1",
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
  }, [data, weekRange, filterValue, fieldToAggregate]);

  // Unified chart configuration function
  const createChartConfig = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: <none>
    (data: any, title: string): ChartConfiguration => {
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
              stacked: true,
              title: {
                display: true,
                text: "Fail Count",
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
            y1: {
              type: "linear" as const,
              display: true,
              position: "right" as const,
              min: 0,
              max: 1,
              title: {
                display: true,
                text: "RHI Percentage",
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
                callback: (value: number) => `${(value * 100).toFixed(1)}%`,
              },
              grid: {
                drawOnChartArea: false,
              },
            },
          } as ChartOptions["scales"],
        },
      };
    },
    [],
  );

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

    // console.log("chartData", chartData);

    // Unified chart creation - iterate through all kabupaten data
    Object.keys(chartData.kabupatenData).forEach((kabupaten) => {
      console.log("Creating chart for", kabupaten);
      const kabData = chartData.kabupatenData[kabupaten];
      const chartKey = `hq-rhi-${kabupaten}`;
      const chartRef = chartRefs.current[chartKey];
      if (!chartRef) return;

      const ctx = chartRef.getContext("2d");
      if (!ctx) return;

      const config = createChartConfig(kabData, `RHI - ${fieldToAggregate.toUpperCase()} ${kabupaten}`);
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

  // console.log(getChartData);

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
                  availableWeeks={data?.rows?.map((row) => row.yearweek)}
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
                          chartRefs.current[`hq-rhi-${kabupaten}`] = el;
                        }}
                      />
                    </div>
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

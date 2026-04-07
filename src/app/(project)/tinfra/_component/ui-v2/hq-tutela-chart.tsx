"use client";

import { useEffect, useMemo, useRef } from "react";

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

Chart.register(CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend);

interface MeasPlos4GData {
  rows: {
    year_week: number;
    Lose: string;
    Win: string;
    target_kpi: string;
  }[];
}

interface AggCustomProps {
  labels?: string[];
  loseData?: number[];
  winData?: number[];
  targetKPIData?: number[];
  apiPath: string;
  fieldToAggregate: string;
}

export default function KPIChart({
  apiPath,
  fieldToAggregate,
  labels = ["202502", "202503", "202504", "202505"],
  loseData = [7, 7, 7, 6],
  winData = [9, 9, 9, 10],
  targetKPIData = [11, 11, 11, 11],
}: AggCustomProps) {
  const { dateRange2, filter, siteId, nop, kabupaten, batch, kecamatan, region, weekRange, setWeekRange } =
    useFilterStore();
  // Get the appropriate filter value based on fieldToAggregate
  const filterValue = fieldToAggregate === "kabupaten" ? kabupaten : siteId;

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
    queryKey: ["hq-tutela", apiPath, dateRange2, filter, siteId, nop, kabupaten, batch, region],
    queryFn: async () => {
      if (!shouldFetch) {
        return { rows: [] };
      }
      const response = await fetch(
        `/tinfra/api/meas-db-ti-sul/${apiPath}?fieldToAggregate=${fieldToAggregate}&batch=${batch}&siteId=${siteId}&nop=${nop}&kabupaten=${kabupaten}&kecamatan=${kecamatan}&region=${region}&tgl_1=${dateRange2?.split("|")[0]}&tgl_2=${dateRange2?.split("|")[1]}`,
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
      // Removed unused setAllSites reference
    }
  }, [data]);

  // Process chart data - moved before conditional returns
  const getChartData = useMemo(() => {
    if (!data?.rows || data.rows.length === 0) {
      return { labels: [], datasets: [], weekRange: [202601, 202652] };
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

    // Sort data by year_week
    const sortedData = [...filteredData].sort((a, b) => a.year_week - b.year_week);

    // Create datasets for the chart
    const datasets = [
      {
        label: "Lose",
        data: sortedData.map((row) => Number(row.Lose) || 0),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderWidth: 2,
        type: "bar" as const,
        yAxisID: "y",
        stack: "stack1",
        datalabels: {
          display: true, // hide the labels on points
        },
      },
      {
        label: "Win",
        data: sortedData.map((row) => Number(row.Win) || 0),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderWidth: 2,
        type: "bar" as const,
        yAxisID: "y",
        stack: "stack1",
        datalabels: {
          display: true, // hide the labels on points
        },
      },
      {
        label: "Target KPI",
        data: sortedData.map((row) => Number(row.target_kpi) || 0),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        borderWidth: 2,
        type: "line" as const,
        yAxisID: "y",
        borderDash: [5, 5],
        tension: 0.1,
        datalabels: {
          display: false, // hide the labels on points
        },
      },
    ];

    return {
      labels: sortedData.map((row) => `Week ${row.year_week}`),
      datasets,
      weekRange: [normalizedMinWeek, maxWeek],
    };
  }, [data, weekRange]);

  useEffect(() => {
    // Clean up existing charts
    Object.keys(chartInstances.current).forEach((key) => {
      if (chartInstances.current[key]) {
        chartInstances.current[key]?.destroy();
        chartInstances.current[key] = null;
      }
    });

    // Create single chart for all data
    const chartData = getChartData;
    if (!chartData.labels.length) return;

    const chartKey = "hq-tutela";
    const chartRef = chartRefs.current[chartKey];
    if (!chartRef) return;

    const ctx = chartRef.getContext("2d");
    if (!ctx) return;

    const config: ChartConfiguration = {
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
            text: `TUTELA KPI - ${fieldToAggregate === undefined ? "" : fieldToAggregate.toUpperCase()} SULAWESI`,
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
              display: true,
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
              display: true,
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

    chartInstances.current[chartKey] = new Chart(ctx, config);

    return () => {
      Object.keys(chartInstances.current).forEach((key) => {
        if (chartInstances.current[key]) {
          chartInstances.current[key]?.destroy();
          chartInstances.current[key] = null;
        }
      });
    };
  }, [getChartData, fieldToAggregate]);

  if (isPending) return <EnhancedLoadingState />;
  if (isError) return <ErrorState message={error.message} />;
  if (!shouldFetch) return <NoDataState message="Please select a date range to view data" />;
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
          <div className="mb-8 lg:col-span-12">
            <div className="rounded-md border bg-white p-4">
              <div className="h-96">
                <canvas
                  ref={(el) => {
                    chartRefs.current["hq-tutela"] = el;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

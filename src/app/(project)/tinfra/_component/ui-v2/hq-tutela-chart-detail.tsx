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

Chart.register(CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend);

interface MeasPlos4GData {
  rows: {
    location: string;
    year_week: number;
    Lose: string;
    Win: string;
    target_kpi: string;
    provider: string;
    level: string;
    metric: string;
    rank: string;
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
  fill?: boolean;
  pointRadius?: number;
  pointHoverRadius?: number;
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
  isMultiKabupaten: boolean;
}

interface AggCustomProps {
  labels?: string[];
  loseData?: number[];
  winData?: number[];
  targetKPIData?: number[];
  apiPath: string;
  fieldToAggregate: string;
  provider: string;
  level: string;
  location: string;
}

export default function KPIChartDetail({ apiPath, fieldToAggregate, provider, level, location }: AggCustomProps) {
  const { dateRange2, filter, siteId, nop, kabupaten, batch, kecamatan, region, weekRange, setWeekRange } =
    useFilterStore();
  // Get the appropriate filter value based on fieldToAggregate
  const filterValue = fieldToAggregate === "region" ? region : fieldToAggregate === "kabupaten" ? kabupaten : siteId;

  console.log(fieldToAggregate);

  const shouldFetch = Boolean(
    dateRange2?.includes("|") &&
      filterValue &&
      filterValue.trim().length > 0 &&
      filterValue !== "---" &&
      filterValue !== "All",
  );
  const chartRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
  const chartInstances = useRef<{ [key: string]: Chart | null }>({});

  // Define metric name mapping
  const getMetricDisplayName = useCallback((metric: string): string => {
    const metricMap: { [key: string]: string } = {
      consistentquality_overall: "Consistent Quality Overall",
      download_5g: "Download 5G",
      download_overall: "Download Overall",
      gamesexperience_5g: "Games Experience 5G",
      gamesexperience_overall: "Games Experience Overall",
      onxcoveragesim_5g: "On Xcoverage Sim 5G",
      onxcoveragesim_overall: "On Xcoverage Sim Overall",
      reliability_overall: "Reliability Overall",
      timeon_5g: "Time On 5G",
      timeon_overall: "Time On Overall",
      upload_5g: "Upload 5G",
      upload_overall: "Upload Overall",
      videoexperience_5g: "Video Experience 5G",
      videoexperience_overall: "Video Experience Overall",
      voiceexperience_5g: "Voice Experience 5G",
      voiceexperience_overall: "Voice Experience Overall",
    };
    return metricMap[metric] || metric;
  }, []);
  const [allSites, setAllSites] = useState<string[]>([]);

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
      provider,
      level,
      weekRange,
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
          `provider=${provider}`,
          `level=${level}`,
          `location=${location}`,
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

  // console.log("Data:", data);

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
        isMultiKabupaten: false,
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

    // Group data by metric and create separate chart data for each metric
    const metricGroups: { [key: string]: (typeof data.rows)[0][] } = {};

    filteredData.forEach((row) => {
      const metric = row.metric || "Unknown";
      if (!metricGroups[metric]) {
        metricGroups[metric] = [];
      }
      metricGroups[metric].push(row);
    });

    const allWeeks = [...new Set(filteredData.map((row) => row.year_week))].sort();
    const labels = allWeeks.map((week) => `Week ${week}`);

    // Define colors for specific providers
    const getProviderColor = (providerName: string): string => {
      const provider = providerName.toLowerCase();
      if (provider === "telkomsel") {
        return "rgba(255, 99, 132, 1)"; // Red
      }
      if (provider === "indosat") {
        return "rgba(255, 206, 86, 1)"; // Yellow
      }
      if (provider === "xl" || provider === "xl axiata") {
        return "rgba(54, 162, 235, 1)"; // Blue
      }
      // Default colors for other providers
      const defaultColors = [
        "rgba(75, 192, 192, 1)", // Green
        "rgba(153, 102, 255, 1)", // Purple
        "rgba(255, 159, 64, 1)", // Orange
      ];
      const index = provider.charCodeAt(0) % defaultColors.length;
      return defaultColors[index];
    };

    // Create separate chart data for each metric
    const metricChartData: { [key: string]: KabupatenChartData } = {};

    Object.keys(metricGroups).forEach((metric) => {
      const metricData = metricGroups[metric];

      // Group by provider within this metric
      const providerGroups: { [key: string]: (typeof data.rows)[0][] } = {};
      metricData.forEach((row) => {
        const provider = row.provider || "Unknown";
        if (!providerGroups[provider]) {
          providerGroups[provider] = [];
        }
        providerGroups[provider].push(row);
      });

      // Create datasets for each provider within this metric
      const datasets: ChartDataSet[] = [];

      Object.keys(providerGroups).forEach((provider) => {
        const providerData = providerGroups[provider];
        const color = getProviderColor(provider);

        // Create data points for each week using rank
        const dataPoints = allWeeks.map((week) => {
          const row = providerData.find((r) => r.year_week === week);
          return row ? Number(row.rank) || 0 : 0;
        });

        datasets.push({
          label: provider,
          data: dataPoints,
          borderColor: color,
          backgroundColor: color.replace("1)", "0.1)"),
          borderWidth: 2,
          type: "line" as const,
          yAxisID: "y",
          tension: 0.1,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          datalabels: {
            display: false,
          },
        });
      });

      metricChartData[metric] = {
        labels,
        datasets,
      };
    });

    return {
      labels,
      datasets: [],
      weekRange: [normalizedMinWeek, maxWeek],
      kabupatenData: metricChartData,
      isMultiKabupaten: true, // Use this to indicate multiple metrics
    };
  }, [data, weekRange]);

  // Unified chart configuration function
  const createChartConfig = useCallback((data: any, title: string): ChartConfiguration => {
    return {
      type: "line",
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
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
              text: "Year Week",
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
              display: false,
              text: "Metric Value",
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

    // Create separate chart for each metric
    Object.keys(chartData.kabupatenData).forEach((metric) => {
      const metricData = chartData.kabupatenData[metric];
      const chartKey = `hq-tutela-detail-${metric}`;
      const chartRef = chartRefs.current[chartKey];
      if (!chartRef) return;

      const ctx = chartRef.getContext("2d");
      if (!ctx) return;

      // const title = `TUTELA - ${fieldToAggregate?.toUpperCase() ?? ""} ${kabupaten} - ${getMetricDisplayName(metric)}`;
      const title = `${getMetricDisplayName(metric)}`;
      const config = createChartConfig(metricData, title);
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
  }, [getChartData, createChartConfig, getMetricDisplayName]);

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
    <div className="min-h-screen bg-gray-50 mt-4">
      {/* <div className="w-full max-w-full overflow-hidden overflow-x-hidden rounded-xl border bg-white p-4 shadow-sm lg:p-6"> */}
      {/* Chart Section */}
      <div className="mb-8 lg:col-span-12">
        {/* Multiple Charts - One for each metric */}
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-2 xl:grid-cols-2">
          {Object.keys(getChartData.kabupatenData).map((metric) => {
            return (
              <div key={metric} className="rounded-md border bg-white p-2">
                <div className="h-80">
                  <canvas
                    ref={(el) => {
                      chartRefs.current[`hq-tutela-detail-${metric}`] = el;
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}

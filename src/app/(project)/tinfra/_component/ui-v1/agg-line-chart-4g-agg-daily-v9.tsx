// biome-ignore assist/source/organizeImports: <will fix later>
import type React from "react";
import { useRef, useEffect, useMemo } from "react";
import {
  Chart,
  Filler,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from "chart.js";
import type { Data2G4GModel } from "@/types/schema";
// import { extractCellName } from "../../_function/helper";
import {
  chartJsColors,
  chartJsColorsTransparent,
  chartJsV1Settings,
  // hexToRGBA,
} from "../contexts/chartjs/chartjs-settings";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Import the plugin
import type { ViewMode } from "./agg-charts-section-4g";

Chart.register(
  Filler,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  ChartDataLabels,
);

interface LineChartProps {
  data: Data2G4GModel[];
  metric_num: string;
  metric_denum?: string;
  aggregation?: "sum" | "avg";
  aggregation_by?: keyof Data2G4GModel;
  title?: string;
  showPayload?: boolean;
  showAggregatedKPI?: boolean;
  isExtractCellName?: boolean;
  viewMode: ViewMode;
}

const LineChart4GAggDaily: React.FC<LineChartProps> = ({
  data,
  metric_num,
  metric_denum,
  aggregation = "sum",
  aggregation_by = "G4_NAMA_CLUSTER",
  title = "%",
  // showPayload = false,
  showAggregatedKPI = true,
  // isExtractCellName = false,
  // Only viewMode prop
  viewMode = "aggregated",
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const isDropRatePercentage = title.toUpperCase().includes("DROP RATE");
  const isSeCqi = title.toUpperCase().includes("SE BH") || title.toUpperCase().includes("CQI BH");
  const isTrafficChart = useMemo(() => {
    return title.toLowerCase().includes("traffic") || title.toLowerCase().includes("payload");
  }, [title]);

  const isMaxUserChart = useMemo(() => {
    return title.toLowerCase().includes("rrc user");
  }, [title]);

  const isThpChart = useMemo(() => {
    return title.toLowerCase().includes("dl throughput") || title.toLowerCase().includes("ul throughput");
  }, [title]);

  const _isViewModeAggregated = useMemo(() => viewMode === "aggregated", [viewMode]);

  // Separate data processing from gradient creation
  const baseChartData = useMemo(() => {
    if (!data?.length) return { labels: [], datasets: [] };

    const isPercentage = title.includes("%");
    const isAverage = aggregation === "avg" || title.includes("AVG");
    const isDenumBy1 = metric_denum === "DENUMBY1";

    const groups: Record<string, Record<string, { num: number; denum: number; count: number; payload: number }>> = {};
    const dates = new Set<string>();

    data.forEach((item) => {
      const date = new Date(item.BEGIN_TIME).toLocaleDateString();
      // change here for aggregate level
      const groupKey = String(item[aggregation_by] || "Unknown");

      dates.add(date);

      if (!groups[groupKey]) groups[groupKey] = {};
      if (!groups[groupKey][date]) {
        groups[groupKey][date] = { num: 0, denum: 0, count: 0, payload: 0 };
      }

      const actualNumValue = (item as any)[metric_num];
      const actualDenumValue = isDenumBy1 ? 1 : (item as any)[metric_denum!];

      const numValue = Number(actualNumValue) || 0;
      const denumValue = isDenumBy1 ? 1 : Number(actualDenumValue) || 0;
      const payloadValue = Number((item as any).TOTAL_PAYLOAD_GB) || 0;

      groups[groupKey][date].num += numValue;
      groups[groupKey][date].denum += denumValue;
      groups[groupKey][date].count += 1;
      groups[groupKey][date].payload += payloadValue;
    });

    const sortedDates = Array.from(dates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const sortedGroups = Object.keys(groups).sort();

    const metricDatasets = sortedGroups.map((groupKey, index) => {
      const color = chartJsColors[index % chartJsColors.length];
      const colorBg = chartJsColorsTransparent[index % chartJsColors.length];

      const values = sortedDates.map((date) => {
        const groupData = groups[groupKey][date];
        if (!groupData) return 0;

        const num = groupData.num;
        const denum = isDenumBy1 ? 1 : groupData.denum;

        if (denum === 0) return 0;

        let value = isDenumBy1 ? num : isDropRatePercentage ? num / denum : num / denum;
        if (isPercentage && !isDropRatePercentage) value *= 100;
        if (isAverage && groupData.count > 0) value /= groupData.count;

        const result = Number(value.toFixed(4));
        return result;
      });

      return {
        label: groupKey,
        data: values,
        borderColor: color,
        backgroundColor: colorBg,
        tension: 0.3,
        pointRadius: 0,
        fill: false,
        stack: isTrafficChart ? "stack" : undefined,
        yAxisID: "y" as const,
      };
    });

    return {
      labels: sortedDates,
      datasets: metricDatasets,
      sortedGroups,
      groups,
      isDenumBy1,
      isPercentage,
      isAverage,
    };
  }, [data, metric_num, metric_denum, aggregation, title, isDropRatePercentage, isTrafficChart, aggregation_by]);

  useEffect(() => {
    if (!chartRef.current || !baseChartData.labels.length) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const {
      labels,
      datasets: metricDatasets,
      sortedGroups = [], // Default to empty array
      groups = {}, // Default to empty object
      isDenumBy1 = false,
      isPercentage = false,
      isAverage = false,
    } = baseChartData;

    const sortedDates = labels;

    // Create gradient here - canvas context is now available
    const horizontalGradient = ctx.createLinearGradient(0, 0, 0, 310);
    horizontalGradient.addColorStop(0, "#969696");
    horizontalGradient.addColorStop(1, "#ffffff");

    // Add aggregated KPI dataset (overall num/denum across all groups)
    const aggregatedKPIDataset =
      showAggregatedKPI && sortedGroups.length > 0
        ? {
            label: isTrafficChart ? `Total - ${title}` : `Agg - ${title}`,
            data: sortedDates.map((date) => {
              // Calculate total num and denum across all groups for this date
              let totalNum = 0;
              let totalDenum = 0;
              let totalCount = 0;

              sortedGroups.forEach((groupKey) => {
                const groupData = groups[groupKey]?.[date];
                if (groupData) {
                  totalNum += groupData.num;
                  totalDenum += isDenumBy1 ? 1 : groupData.denum;
                  totalCount += groupData.count;
                }
              });

              if (totalDenum === 0) return 0;

              let value = isDenumBy1
                ? totalNum
                : isDropRatePercentage
                  ? 100 - totalNum / totalDenum
                  : totalNum / totalDenum;
              if (isPercentage && !isDropRatePercentage) value *= 100;
              if (isAverage && totalCount > 0) value /= totalCount;

              return Number(value.toFixed(4));
            }),
            borderColor: "rgba(0, 0, 0, 0.6)",
            backgroundColor: horizontalGradient,
            borderWidth: 3.5,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 3,
            borderDash: [3, 0] as [number, number],
            fill: { target: "start" as const },
            yAxisID: viewMode === "aggregated" ? "y" : "y1",
            type: "line" as const,
          }
        : null;

    // Combine all datasets based on view mode from parent
    let allDatasets: any[] = [];

    if (viewMode === "metrics" || viewMode === "both") {
      allDatasets = [...metricDatasets];
    }

    if ((viewMode === "aggregated" || viewMode === "both") && aggregatedKPIDataset) {
      allDatasets.push(aggregatedKPIDataset);
    }

    const chartData = {
      labels: sortedDates,
      datasets: allDatasets,
    };

    const config: ChartConfiguration<"line"> = {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: {
            display: false,
          },
          legend: {
            onClick: () => null, // Disable legend click
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
              // family: chartJsV1Settings.titleFontFamily,
              weight: chartJsV1Settings.titleFontWeight,
            },
          },
          tooltip: {
            mode: isTrafficChart ? "nearest" : "index",
            intersect: false,
            backgroundColor: chartJsV1Settings.tooltipBackgroundColor,
            titleFont: {
              size: chartJsV1Settings.tooltipTitleFontSize,
            },
            bodyFont: {
              size: chartJsV1Settings.tooltipBodyFontSize,
            },
            padding: 12,
            callbacks: {
              label: (context) => {
                const datasetLabel = context.dataset.label || "";
                const value = context.parsed.y || 0;

                if (isTrafficChart || isMaxUserChart) {
                  return `${datasetLabel}: ${new Intl.NumberFormat("en-US", {
                    notation: "standard",
                    compactDisplay: "short",
                    maximumFractionDigits: 2,
                  }).format(value)}`;
                }

                if (isThpChart) {
                  return `${datasetLabel}: ${new Intl.NumberFormat("en-US", {
                    notation: "standard",
                    compactDisplay: "short",
                    maximumFractionDigits: 2,
                  }).format(value)} bps`;
                }

                if (datasetLabel.includes("Payload")) {
                  return `${datasetLabel}: ${value.toFixed(2)} GB`;
                }
                if (isDropRatePercentage) {
                  return `${datasetLabel}: ${value.toFixed(4)}`;
                }
                if (datasetLabel.includes("Agg") || datasetLabel.includes("Total")) {
                  return `${datasetLabel}: ${value.toFixed(isPercentage ? 2 : 2)}${isPercentage ? "%" : ""}`;
                }

                if (isSeCqi) {
                  return `${datasetLabel}: ${value.toFixed(2)}`;
                }
                return `${datasetLabel}: ${value.toFixed(isPercentage ? 2 : 2)}${isPercentage ? "%" : ""}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: isTrafficChart,
            stacked: false,
            title: {
              text: String(aggregation_by),
              font: {
                size: chartJsV1Settings.yAxisTitleFontSize,
                family: chartJsV1Settings.legendFontFamily,
                weight: chartJsV1Settings.yAxisTitleFontWeight,
              },
            },
            ticks: {
              font: {
                size: chartJsV1Settings.yAxisTickFontSize,
              },
              callback: (value) => {
                if (typeof value === "number") {
                  if (isTrafficChart || isMaxUserChart || isThpChart) {
                    return new Intl.NumberFormat("en-US", {
                      notation: "compact",
                      compactDisplay: "short",
                      maximumFractionDigits: 2,
                    }).format(value);
                  }
                  if (isPercentage && !isDropRatePercentage) {
                    return `${value.toFixed(2)}%`;
                  }
                  if (isDropRatePercentage) {
                    return `${value.toFixed(2)}%`;
                  }
                  if (isSeCqi) {
                    return `${value.toFixed(2)}`;
                  }
                  return value.toFixed(0);
                }
                return value;
              },
            },
            grid: {
              display: false,
            },
            position: "left",
            display: true,
          },
          y1: {
            beginAtZero: isTrafficChart,
            title: {
              display: showAggregatedKPI && viewMode !== "metrics",
              text: isTrafficChart ? `Total - ${title}` : `Agg - ${title}`,
              font: {
                size: chartJsV1Settings.yAxisTitleFontSize,
                family: chartJsV1Settings.legendFontFamily,
                weight: chartJsV1Settings.yAxisTitleFontWeight,
              },
            },
            ticks: {
              font: {
                size: chartJsV1Settings.yAxisTickFontSize,
              },
              callback: (value) => {
                if (typeof value === "number") {
                  if (isTrafficChart || isMaxUserChart || isThpChart) {
                    return new Intl.NumberFormat("en-US", {
                      notation: "compact",
                      compactDisplay: "short",
                      maximumFractionDigits: 2,
                    }).format(value);
                  }
                  if (isPercentage && !isDropRatePercentage) {
                    return `${value.toFixed(2)}%`;
                  }
                  if (isDropRatePercentage) {
                    return `${value.toFixed(2)}%`;
                  }
                  if (isSeCqi) {
                    return `${value.toFixed(2)}`;
                  }
                  return value.toFixed(0);
                }
                return value;
              },
            },
            position: "right",
            grid: {
              display: false,
            },
            display: viewMode !== "metrics" ? "auto" : false,
          },
          x: {
            ticks: {
              maxTicksLimit: 10,
              font: {
                size: chartJsV1Settings.xAxisTickFontSize,
              },
            },
            stacked: isTrafficChart,
            grid: {
              display: false,
            },
          },
        },
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
      },
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [
    baseChartData,
    title,
    aggregation_by,
    showAggregatedKPI,
    isTrafficChart,
    isDropRatePercentage,
    viewMode,
    isSeCqi,
    isMaxUserChart,
    isThpChart,
  ]);

  if (!data?.length) {
    return <div className="flex items-center justify-center p-10 text-gray-500 text-lg">No data available</div>;
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Removed the ViewToggle component from here */}
      <div className="h-80 rounded-lg bg-white p-2">
        <div className="h-full">
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  );
};

export default LineChart4GAggDaily;

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
import { extractCellName } from "../../_function/helper";
import {
  chartJsColors,
  chartJsColorsTransparent,
  chartJsV1Settings,
  hexToRGBA,
} from "../contexts/chartjs/chartjs-settings";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Import the plugin

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
}

const LineChart4GAggDaily: React.FC<LineChartProps> = ({
  data,
  metric_num,
  metric_denum,
  aggregation = "sum",
  aggregation_by = "NOP",
  title = "%",
  showPayload = true,
  showAggregatedKPI = true,
  isExtractCellName = false,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const isDropRatePercentage = title.toUpperCase().includes("DROP RATE");
  const isTrafficChart = useMemo(() => {
    return title.toLowerCase().includes("traffic") || title.toLowerCase().includes("payload");
  }, [title]);

  // Process chart data
  // Process chart data
  const chartData = useMemo(() => {
    if (!data?.length) return { labels: [], datasets: [] };

    const isPercentage = title.includes("%");
    const isAverage = aggregation === "avg" || title.includes("AVG");
    const isDenumBy1 = metric_denum === "DENUMBY1";

    const groups: Record<string, Record<string, { num: number; denum: number; count: number; payload: number }>> = {};
    const dates = new Set<string>();

    data.forEach((item) => {
      const date = new Date(item.BEGIN_TIME).toLocaleDateString();

      const groupKey = String(item.G4_KABUPATEN || "Unknown");

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

        let value = isDenumBy1 ? num : isDropRatePercentage ? 100 - num / denum : num / denum;
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
        fill: false, //isTrafficChart ? { target: 'start' as const } : false, // Use object for fill when needed
        stack: isTrafficChart ? "stack" : undefined,
        yAxisID: "y" as const,
      };
    });

    if (!chartRef.current) return { labels: [], datasets: [] };

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return { labels: [], datasets: [] };

    const horizontalGradient = ctx.createLinearGradient(0, 0, 0, 310);
    horizontalGradient.addColorStop(0, "#969696");
    horizontalGradient.addColorStop(1, "#ffffff");

    // Add aggregated KPI dataset (overall num/denum across all groups)
    const aggregatedKPIDataset = showAggregatedKPI
      ? {
          label: isTrafficChart ? `Total - ${title}` : `Agg - ${title}`,
          data: sortedDates.map((date) => {
            // Calculate total num and denum across all groups for this date
            let totalNum = 0;
            let totalDenum = 0;
            let totalCount = 0;

            sortedGroups.forEach((groupKey) => {
              const groupData = groups[groupKey][date];
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
          backgroundColor: horizontalGradient, //"rgba(0, 0, 0, 0.2)",
          borderWidth: 3.5,
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 3,
          borderDash: [3, 0] as [number, number],
          fill: { target: "start" as const },
          yAxisID: "y1" as const,
          type: "line" as const,
        }
      : null;

    showPayload = false;
    const payloadDataset = showPayload
      ? {
          label: "Total Payload (GB)",
          data: sortedDates.map((date) => {
            const totalPayload = sortedGroups.reduce(
              (sum, groupKey) => sum + (groups[groupKey][date]?.payload || 0),
              0,
            );
            return Number(totalPayload.toFixed(2));
          }),
          borderColor: "#ff6384",
          backgroundColor: "rgba(255, 99, 132, 0.4)",
          tension: 0.3,
          pointRadius: 3,
          fill: { target: "start" as const, above: "rgba(255, 99, 132, 0.3)" },
          yAxisID: "y1" as const,
          type: "line" as const,
        }
      : null;

    // Combine all datasets with proper typing
    const allDatasets: any[] = [...metricDatasets];

    if (aggregatedKPIDataset) {
      allDatasets.push(aggregatedKPIDataset);
    }

    if (payloadDataset) {
      allDatasets.push(payloadDataset);
    }

    return {
      labels: sortedDates,
      datasets: allDatasets,
    };
  }, [
    data,
    metric_num,
    metric_denum,
    aggregation,
    title,
    showPayload,
    showAggregatedKPI,
    isDropRatePercentage,
    isTrafficChart,
  ]);

  useEffect(() => {
    if (!chartRef.current || !chartData.labels.length) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const isPercentage = title.includes("%");

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
                family: chartJsV1Settings.legendFonstFamily,
                weight: chartJsV1Settings.legendFontWeight,
              },
            },
          },
          title: {
            display: true,
            text: title,
            font: {
              size: chartJsV1Settings.titleFontSize,
              family: chartJsV1Settings.titleFonstFamily,
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

                if (datasetLabel.includes("Payload")) {
                  return `${datasetLabel}: ${value.toFixed(2)} GB`;
                }
                if (datasetLabel.includes("Overall")) {
                  return `${datasetLabel}: ${value.toFixed(isPercentage ? 3 : 3)}${isPercentage ? "%" : ""}`;
                }
                return `${datasetLabel}: ${value.toFixed(isPercentage ? 3 : 3)}${isPercentage ? "%" : ""}`;
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
                family: chartJsV1Settings.legendFonstFamily,
                weight: chartJsV1Settings.yAxisTitleFontWeight,
              },
            },
            ticks: {
              font: {
                size: chartJsV1Settings.yAxisTickFontSize,
              },
              // callback: (value) => {
              //   if (typeof value === "number") {
              //     if (isPercentage && !isDropRatePercentage) {
              //       return `${value.toFixed(3)}%`;
              //     }
              //     if (isDropRatePercentage) {
              //       return `${value.toFixed(3)}%`;
              //     }
              //     return value.toFixed(3);
              //   }
              //   return value;
              // },
            },
            grid: {
              display: false,
            },
            position: "left",
          },
          y1: {
            beginAtZero: isTrafficChart,
            title: {
              display: showPayload,
              text: isTrafficChart ? `Total - ${title}` : `Agg - ${title}`,
              font: {
                size: chartJsV1Settings.yAxisTitleFontSize,
                family: chartJsV1Settings.legendFonstFamily,
                weight: chartJsV1Settings.yAxisTitleFontWeight,
              },
            },
            ticks: {
              font: {
                size: chartJsV1Settings.yAxisTickFontSize,
              },
            },
            position: "right",
            grid: {
              display: false,
            },
            display: "auto",
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
  }, [chartData, title, aggregation_by, showPayload, isTrafficChart]);

  if (!data?.length) {
    return <div className="flex items-center justify-center p-10 text-gray-500 text-lg">No data available</div>;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="h-80 rounded-lg bg-white p-2">
        <div className="h-full">
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  );
};

export default LineChart4GAggDaily;

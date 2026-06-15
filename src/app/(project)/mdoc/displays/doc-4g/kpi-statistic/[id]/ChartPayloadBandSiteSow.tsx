"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

import { chartJsColors, chartJsColorsTransparent, chartJsV1Settings } from "@/app/(project)/mdoc/def/chartjs-setting";
import type { DataActivityLog } from "@/app/(project)/mdoc/def/interfaces";

ChartJS.register(
  Filler,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

interface DataPayloadBandSiteSow {
  begin_time: string;
  group_by: string;
  productivity_val: number;
}

interface ChartPayloadBandSiteSowProps {
  data: DataPayloadBandSiteSow[];
  legendBy: string;
  dataActivityLog: DataActivityLog[];
}

export default function ChartPayloadBandSiteSow({
  data,
  legendBy = "site",
  dataActivityLog = [],
}: ChartPayloadBandSiteSowProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Get unique bands for legend
    const bands = [...new Set(data.map((item) => item.group_by))];

    // Sort by begin_time
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.begin_time.replace(" ", "T"));
      const dateB = new Date(b.begin_time.replace(" ", "T"));
      return dateA.getTime() - dateB.getTime();
    });

    // Get unique dates for labels
    const uniqueDates = [...new Set(sortedData.map((item) => item.begin_time))].sort();

    // Format x-axis labels (dd/mm/yyyy)
    const labels = uniqueDates.map((dateStr) => {
      const date = new Date(dateStr.replace(" ", "T"));
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    });

    // Payload by band as line chart (left axis)
    const payloadDatasets = bands.map((band, index) => {
      let newIndex = 1;
      if (band === "L900") {
        newIndex = 1;
      } else if (band === "L1800") {
        newIndex = 0;
      } else if (band === "L2100") {
        newIndex = 14;
      } else if (band === "L2300") {
        newIndex = 29;
      } else {
        newIndex = index;
      }

      const color = chartJsColors[newIndex % chartJsColors.length];
      const colorBg = chartJsColorsTransparent[newIndex % chartJsColors.length];
      return {
        type: "line" as const,
        label: `${band}`,
        data: uniqueDates.map((date) => {
          const item = sortedData.find((d) => d.begin_time === date && d.group_by === band);
          return item?.productivity_val ?? 0;
        }),
        backgroundColor: colorBg,
        borderColor: color,
        borderWidth: 3,
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        yAxisID: band === "2G" ? "y1" : "y",
        dataLabels: { display: false },
      };
    });

    // Total payload as line chart (right axis) - calculate from all bands per date
    const totalDataset = {
      type: "line" as const,
      label: "Total Payload (GB)",
      data: uniqueDates.map((date) => {
        return sortedData.filter((d) => d.begin_time === date).reduce((sum, item) => sum + item.productivity_val, 0);
      }),
      borderColor: "#b8d0fb",
      backgroundColor: "#b8d0fb",
      yAxisID: "y",
      fill: { target: "start" as const },
      tension: 0.3,
      borderWidth: 0,
      pointRadius: 0,
      dataLabels: { display: false },
    };

    const activityLogDataset = {
      type: "bar" as const,
      label: "Activity Log",
      data: uniqueDates.map((date) => {
        const hasActivity = dataActivityLog.some((log) => log.tanggal?.startsWith(date));
        return hasActivity ? 1 : 0;
      }),
      _activityLogIndices: uniqueDates.map((date) => {
        const idx = dataActivityLog.findIndex((log) => log.tanggal?.startsWith(date));
        return idx >= 0 ? idx + 1 : null;
      }),
      borderColor: "#00000099",
      backgroundColor: "#00000099",
      yAxisID: "yActivity",
      fill: { target: "start" as const },
      tension: 0.3,
      borderWidth: 0,
      pointRadius: 0,
      order: 0,
      barPercentage: uniqueDates.length < 20 ? 1.0 : 1.0,
      categoryPercentage: uniqueDates.length < 20 ? 0.1 : 0.2,
      datalabels: {
        display: true,
        anchor: "end" as const,
        align: "start" as const,
        backgroundColor: "#fff",
        borderColor: "#666",
        borderWidth: 1,
        borderRadius: 4,
        color: "#333",
        font: {
          size: 10,
          weight: "bold" as const,
        },
        padding: 4,
        formatter: (
          _value: number,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          context: any,
        ) => {
          const idx = context.dataset?._activityLogIndices?.[context.dataIndex];
          const label = idx?.toString() ?? "";
          return label === "" ? null : label;
        },
      },
    };

    // Payload bands first (behind), total last (on top)
    const allDatasets = [...payloadDatasets, activityLogDataset, totalDataset];

    const chartData = {
      labels,
      datasets: allDatasets,
    };

    const config = {
      type: "bar" as const,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index" as const,
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text:
              legendBy === "band"
                ? "LTE Payload NE Level - Site Level (GB)"
                : legendBy === "cell2g"
                  ? "2G Payload (Gbyte) Cell Level & Site level"
                  : legendBy === "cluster"
                    ? "Payload Tech Level"
                    : "Total Payload Site Level - Cluster Level (GB)",
            font: {
              size: chartJsV1Settings.titleFontSize,
              weight: chartJsV1Settings.titleFontWeight,
            },
          },
          legend: {
            position: "bottom" as const,
            labels: {
              usePointStyle: true,
              boxWidth: 20,
              padding: 15,
              font: {
                size: chartJsV1Settings.legendFontSize,
                weight: chartJsV1Settings.legendFontWeight,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<"bar">) => {
                const label = context.dataset.label || "";
                const value = context.parsed.y;
                if (label === "Activity Log" && value === 1) {
                  const activityDataset = context.dataset as {
                    _activityLogIndices?: (number | null)[];
                  };
                  const idx = activityDataset._activityLogIndices?.[context.dataIndex];
                  return `${label}: ${idx}`;
                }
                return `${label}: ${value?.toFixed(2)} GB`;
              },
            },
          },
          datalabels: {
            display: false,
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 90,
              minRotation: 90,
              font: {
                size: chartJsV1Settings.xAxisTickFontSize,
              },
            },
            grid: {
              display: false,
            },
          },

          y: {
            beginAtZero: true,
            type: "linear" as const,
            display: true,
            position: "left" as const,
            title: {
              display: true,
              text:
                legendBy === "band"
                  ? "NE Level"
                  : legendBy === "cell2g"
                    ? "Cell Level"
                    : legendBy === "cluster"
                      ? "Total Payload & 4G"
                      : "Site Level",
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
            },
            grid: {
              color: "#e0e0e0",
            },
          },
          y1: {
            beginAtZero: true,
            type: "linear" as const,
            display: true,
            position: "right" as const,
            title: {
              display: true,
              text:
                legendBy === "band"
                  ? "Site Level"
                  : legendBy === "cell2g"
                    ? "Site Level"
                    : legendBy === "cluster"
                      ? "2G"
                      : "Cluster Level",
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
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          yActivity: {
            beginAtZero: true,
            type: "linear" as const,
            display: false,
            position: "right" as const,
            title: {
              display: true,
              text: "Acitivity Log",
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
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    };

    chartInstance.current = new ChartJS(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data, legendBy, dataActivityLog.some, dataActivityLog.findIndex]);

  if (!data?.length) {
    return <div className="flex items-center justify-center p-10 text-gray-500 text-lg">No data available</div>;
  }

  return (
    <div className="mt-12 h-96 w-250">
      <canvas ref={chartRef} />
    </div>
  );
}

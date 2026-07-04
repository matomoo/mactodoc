"use client";

// biome-ignore assist/source/organizeImports: <none>
import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
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
  type ChartConfiguration,
  type TooltipItem,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";

import { chartJsColors, chartJsColorsTransparent, chartJsV1Settings } from "@/app/(project)/mdoc/def/chartjs-setting";
import type { DataActivityLog, DataPayloadBandSiteSow } from "@/app/(project)/mdoc/def/interfaces";

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

export interface ChartRrcUtilizationRef {
  getImageData: () => string | null;
}

interface ChartRrcUtilizationProps {
  data: DataPayloadBandSiteSow[];
  dataActivityLog: DataActivityLog[];
}

const ChartRrcUtilization = forwardRef<ChartRrcUtilizationRef, ChartRrcUtilizationProps>(function ChartRrcUtilization(
  { data, dataActivityLog = [] },
  ref,
) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useImperativeHandle(ref, () => ({
    getImageData: () => {
      if (!chartInstance.current) return null;

      const canvas = chartInstance.current.canvas;
      const width = canvas.width;
      const height = canvas.height;

      // Create a temporary canvas with white background
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext("2d");

      if (!tempCtx) return null;

      // Fill with white background
      tempCtx.fillStyle = "#ffffff";
      tempCtx.fillRect(0, 0, width, height);

      // Draw the chart on top
      tempCtx.drawImage(canvas, 0, 0);

      return tempCanvas.toDataURL("image/jpeg", 1.0);
    },
  }));

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

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

    // RRC connections on left axis (y)
    const rrcDataset = {
      type: "line" as const,
      label: "RRC Connections",
      data: uniqueDates.map((date) => {
        const item = sortedData.find((d) => d.begin_time === date);
        return (item?.rrc_conn ?? 0) as number;
      }),
      backgroundColor: chartJsColorsTransparent[0],
      borderColor: chartJsColors[0],
      borderWidth: 3,
      fill: false,
      tension: 0.3,
      pointRadius: 0,
      yAxisID: "y",
      dataLabels: { display: false },
    };

    // DL Utilization on right axis (y1)
    const dlUtilDataset = {
      type: "line" as const,
      label: "DL Utilization (%)",
      data: uniqueDates.map((date) => {
        const item = sortedData.find((d) => d.begin_time === date);
        return (item?.dl_util ?? 0) as number;
      }),
      backgroundColor: chartJsColorsTransparent[1],
      borderColor: chartJsColors[1],
      borderWidth: 3,
      fill: false,
      tension: 0.3,
      pointRadius: 0,
      yAxisID: "y1",
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

    const chartData = {
      labels,
      datasets: [rrcDataset, activityLogDataset, dlUtilDataset],
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
            text: "RRC Connections & DL Utilization",
            font: {
              size: chartJsV1Settings.titleFontSize,
              weight: chartJsV1Settings.titleFontWeight,
            },
          },
          legend: {
            position: "top" as const,
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
                const suffix = label.includes("%") ? " %" : "";
                return `${label}: ${value?.toFixed(2)}${suffix}`;
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
          y1: {
            beginAtZero: true,
            type: "linear" as const,
            display: true,
            position: "right" as const,
            title: {
              display: true,
              text: "DL Utilization (%)",
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
          y: {
            beginAtZero: true,
            type: "linear" as const,
            display: true,
            position: "left" as const,
            title: {
              display: true,
              text: "RRC Connections",
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
  }, [data, dataActivityLog.findIndex, dataActivityLog.some]);

  if (!data?.length) {
    return <div className="flex items-center justify-center p-10 text-gray-500 text-lg">No data available</div>;
  }

  return (
    <div className="mt-12 h-96 w-250">
      <canvas ref={chartRef} />
    </div>
  );
});

export default ChartRrcUtilization;

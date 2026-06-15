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
  type ChartConfiguration,
} from "chart.js";

import { chartJsColors, chartJsColorsTransparent, chartJsV1Settings } from "@/app/(project)/mdoc/def/chartjs-setting";
import type { DataPayloadBandSiteSow } from "@/app/(project)/mdoc/def/interfaces";

ChartJS.register(Filler, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChartRrcUtilizationProps {
  data: DataPayloadBandSiteSow[];
}

export default function ChartRrcUtilization({ data }: ChartRrcUtilizationProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

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
    };

    const chartData = {
      labels,
      datasets: [rrcDataset, dlUtilDataset],
    };

    const config: ChartConfiguration<"line"> = {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index" as const,
          intersect: false,
        },
        plugins: {
          datalabels: {
            display: false,
          },
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
              label: (context) => {
                const label = context.dataset.label || "";
                const value = context.parsed.y;
                const suffix = label.includes("%") ? " %" : "";
                return `${label}: ${value?.toFixed(2)}${suffix}`;
              },
            },
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
  }, [data]);

  if (!data?.length) {
    return <div className="flex items-center justify-center p-10 text-gray-500 text-lg">No data available</div>;
  }

  return (
    <div className="mt-12 h-96 w-250">
      <canvas ref={chartRef} />
    </div>
  );
}

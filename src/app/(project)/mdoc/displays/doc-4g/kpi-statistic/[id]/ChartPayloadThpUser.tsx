"use client";

import { useEffect, useRef } from "react";

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

import { chartJsColors, chartJsV1Settings } from "@/app/(project)/mdoc/def/chartjs-setting";
import type { DataActivityLog } from "@/app/(project)/mdoc/def/interfaces";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

interface DataPayloadThpUser {
  begin_time: string;
  sector: string;
  payload_gb: number;
  max_cell_pdcp_thp_mbps: number;
  max_rrc_con_user_number: number;
}

interface ChartPayloadThpUserProps {
  data: DataPayloadThpUser[];
  sector: string;
  dataActivityLog: DataActivityLog[];
}

export default function ChartPayloadThpUser({ data, sector, dataActivityLog = [] }: ChartPayloadThpUserProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Filter data by sector
    const filteredData = data.filter((item) => item.sector === sector);

    // Sort by begin_time
    const sortedData = [...filteredData].sort((a, b) => {
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

    // Payload as bar chart (blue)
    const payloadDataset = {
      type: "bar" as const,
      label: "Payload (GB)",
      data: uniqueDates.map((date) => {
        const item = sortedData.find((d) => d.begin_time === date);
        return item?.payload_gb ?? 0;
      }),
      backgroundColor: "rgba(59, 130, 246, 0.6)",
      borderColor: "#3b82f6",
      borderWidth: 0,
      yAxisID: "y",
      order: 3,
    };

    // THP as line chart (orange)
    const thpDataset = {
      type: "line" as const,
      label: "PDCP Thp (Mbps)",
      data: uniqueDates.map((date) => {
        const item = sortedData.find((d) => d.begin_time === date);
        return item?.max_cell_pdcp_thp_mbps ?? 0;
      }),
      borderColor: chartJsColors[1 % chartJsColors.length],
      backgroundColor: chartJsColors[1 % chartJsColors.length],
      yAxisID: "y1",
      fill: false,
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 3,
      order: 1,
    };

    // RRC Users as line chart (gray)
    const rrcDataset = {
      type: "line" as const,
      label: "RRC Users",
      data: uniqueDates.map((date) => {
        const item = sortedData.find((d) => d.begin_time === date);
        return item?.max_rrc_con_user_number ?? 0;
      }),
      borderColor: chartJsColors[0 % chartJsColors.length],
      backgroundColor: chartJsColors[0 % chartJsColors.length],
      yAxisID: "y1",
      fill: false,
      tension: 0.3,
      borderWidth: 3,
      pointRadius: 0,
      order: 2,
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
      categoryPercentage: uniqueDates.length < 20 ? 0.1 : 0.4,
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
          context: {
            dataset?: {
              _activityLogIndices?: (number | null)[];
            };
            dataIndex: number;
          },
        ) => {
          const idx = context.dataset?._activityLogIndices?.[context.dataIndex];
          const label = idx?.toString() ?? "";
          return label === "" ? null : label;
        },
      },
    };

    const chartData = {
      labels,
      datasets: [payloadDataset, thpDataset, rrcDataset, activityLogDataset],
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
          datalabels: {
            display: false,
          },
          title: {
            display: true,
            text: `LTE Payload, Max DL Throughput & User Number`,
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
                if (label.includes("Payload")) {
                  return `${label}: ${value?.toFixed(2)} GB`;
                }
                if (label.includes("PDCP")) {
                  return `${label}: ${value?.toFixed(2)} Mbps`;
                }
                return `${label}: ${value}`;
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
          y: {
            type: "linear" as const,
            display: true,
            position: "left" as const,
            title: {
              display: true,
              text: "Payload (GB)",
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
            type: "linear" as const,
            display: true,
            position: "right" as const,
            title: {
              display: true,
              text: "PDCP Thp (Mbps) / RRC Users",
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
  }, [data, sector, dataActivityLog]);

  if (!data?.length) {
    return <div className="flex items-center justify-center p-10 text-gray-500 text-lg">No data available</div>;
  }

  return (
    <div className="mt-12 h-96 w-250">
      <div className="font-bold text-lg">Sector {sector.slice(7, 20)}</div>
      <canvas ref={chartRef} />
    </div>
  );
}

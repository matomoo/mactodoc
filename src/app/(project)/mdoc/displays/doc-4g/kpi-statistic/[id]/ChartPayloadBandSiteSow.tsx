"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Chart } from "react-chartjs-2";

import { chartJsV1Settings } from "@/app/(project)/mdoc/def/chartjs-setting";

ChartJS.register(Filler, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface DataPayloadBandSiteSow {
  begin_time: string;
  band: string;
  payload_gb: number;
}

interface ChartPayloadBandSiteSowProps {
  data: DataPayloadBandSiteSow[];
}

const BAND_COLORS: Record<string, { bar: string; line: string }> = {
  L1800: { bar: "rgba(59, 130, 246, 0.6)", line: "#3b82f6" },
  // L2100: { bar: "rgba(220, 38, 38, 0.6)", line: "#dc2626" },
  L2100: { bar: "rgba(220, 20, 60, 1)", line: "#dc143c" },
  L900: { bar: "rgba(245, 158, 11, 0.6)", line: "#f59e0b" },
  L2300: { bar: "rgba(239, 68, 68, 0.6)", line: "#ef4444" },
};

export default function ChartPayloadBandSiteSow({ data }: ChartPayloadBandSiteSowProps) {
  // Get unique bands for legend
  const bands = [...new Set(data.map((item) => item.band))];

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

  // Payload by band as bar chart
  const payloadDatasets = bands.map((band) => {
    const colors = BAND_COLORS[band] || {
      bar: "rgba(107, 114, 128, 0.6)",
      line: "#6b7280",
    };
    return {
      type: "line" as const,
      label: `${band} Payload (GB)`,
      data: uniqueDates.map((date) => {
        const item = sortedData.find((d) => d.begin_time === date && d.band === band);
        return item?.payload_gb ?? 0;
      }),
      backgroundColor: colors.bar,
      borderColor: colors.line,
      borderWidth: 3,
      fill: false,
      tension: 0.3,
      pointRadius: 0,
      yAxisID: "y",
      order: 1,
    };
  });

  // Total payload as line chart (right axis) - calculate from all bands per date
  const totalDataset = {
    type: "line" as const,
    label: "Total Payload (GB)",
    data: uniqueDates.map((date) => {
      // Sum all payload_gb for this date across all bands
      return sortedData.filter((d) => d.begin_time === date).reduce((sum, item) => sum + item.payload_gb, 0);
    }),
    borderColor: "#3b82f6",
    backgroundColor: "#b8d0fb",
    yAxisID: "y1",
    fill: { target: "start" as const },
    tension: 0.3,
    borderWidth: 0,
    // borderDash: [5, 5],
    pointRadius: 0,
    order: 0,
  };

  const chartData = {
    labels,
    // totalDataset (order: 0) first = rendered in back
    // payloadDatasets (order: 1) second = rendered on top
    datasets: [totalDataset, ...payloadDatasets],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: "Payload by Band Site SOW",
        font: {
          size: chartJsV1Settings.titleFontSize,
          // family: chartJsV1Settings.titleFontFamily,
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
            // family: chartJsV1Settings.legendFontFamily,
            weight: chartJsV1Settings.legendFontWeight,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"bar" | "line">) => {
            const label = context.dataset.label || "";
            const value = context.raw as number;
            return `${label}: ${value.toFixed(2)} GB`;
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
          text: "Payload by Band (GB)",
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
          text: "Total Payload (GB)",
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
  };

  return (
    <div className="mt-12 h-96 w-250">
      <Chart type="bar" data={chartData} options={options as never} />
    </div>
  );
}

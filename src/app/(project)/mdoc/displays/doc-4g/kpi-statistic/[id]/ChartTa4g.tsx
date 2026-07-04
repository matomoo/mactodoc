"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";

import { chartJsColors, chartJsV1Settings } from "@/app/(project)/mdoc/def/chartjs-setting";
import type { TaDataItem } from "@/app/(project)/mdoc/def/interfaces";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

interface ChartTa4gProps {
  data: TaDataItem[];
  siteid: string;
  band: string;
  cellId: number;
  chart_title?: string;
}

export default function ChartTa4g({ data, siteid, band, cellId, chart_title = "TA Distribution" }: ChartTa4gProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Filter by siteid, band, and/or cellId
    const filteredData = data.filter((item) => {
      const matchSiteid = !siteid || item.siteid === siteid;
      const matchBand = !band || item.band === band;
      const matchCellId = cellId === undefined || item.cellId === cellId;
      return matchSiteid && matchBand && matchCellId;
    });

    // Sort by sort_order to maintain proper TA range order
    const sortedData = [...filteredData].sort((a, b) => a.sort_order - b.sort_order);

    // X-axis labels: ta_range
    const labels = sortedData.map((item) => item.ta_range);

    // Left Y-axis: total_reports as bar
    const totalReportsDataset = {
      type: "bar" as const,
      label: "Total Reports",
      data: sortedData.map((item) => item.total_reports),
      backgroundColor: chartJsColors[0] + "80", // with transparency
      borderColor: chartJsColors[0],
      borderWidth: 1,
      yAxisID: "y",
      order: 2,
      dataLabels: { display: false },
    };

    // Right Y-axis: percentage as line
    const percentageDataset = {
      type: "line" as const,
      label: "Percentage",
      data: sortedData.map((item) => parseFloat(item.percentage)),
      borderColor: chartJsColors[1],
      backgroundColor: "transparent",
      borderWidth: 3,
      fill: false,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: chartJsColors[1],
      yAxisID: "y1",
      order: 1,
      dataLabels: { display: false },
    };

    // Calculate max Y for left axis (total_reports)
    const maxReports = Math.max(...sortedData.map((d) => d.total_reports), 0);
    const maxYReports = maxReports * 1.2;

    // Calculate max Y for right axis (percentage)
    const maxPercentage = Math.max(...sortedData.map((d) => parseFloat(d.percentage) || 0), 0);
    const maxYPercentage = Math.min(maxPercentage * 1.2, 100);

    const chartData = {
      labels,
      datasets: [totalReportsDataset, percentageDataset],
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
            text: chart_title,
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
              label: (context: { dataset: { label?: string }; parsed: { y: number } }) => {
                const label = context.dataset.label || "";
                const value = context.parsed.y;
                if (label === "Percentage") {
                  return `${label}: ${value.toFixed(2)}%`;
                }
                return `${label}: ${value.toLocaleString()}`;
              },
            },
          },
          datalabels: { display: false },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
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
            max: maxYReports,
            title: {
              display: true,
              text: "Total Reports",
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
            max: 120, //maxYPercentage,
            title: {
              display: true,
              text: "Percentage (%)",
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

    // @ts-expect-error ChartJS mixed chart types
    chartInstance.current = new ChartJS(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data, siteid, band, cellId, chart_title]);

  if (!data?.length) {
    return <div className="flex items-center justify-center p-10 text-gray-500 text-lg">No data available</div>;
  }

  return (
    <div className="mt-12 h-96 w-250">
      <canvas ref={chartRef} />
    </div>
  );
}

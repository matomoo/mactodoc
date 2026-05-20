"use client";

import { useMemo } from "react";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ChartDataItem {
  BEGIN_TIME: string;
  SITEID: string;
  TOTAL_PAYLOAD_GB: number;
  TOTAL_TRAFFIC_ERL: number;
  Tech: string;
}

interface ProductivityAllChartsProps {
  data: ChartDataItem[];
  legendBy?: string;
}

const colors = [
  "rgba(59, 130, 246, 1)", // blue
  "rgba(16, 185, 129, 1)", // green
  "rgba(239, 68, 68, 1)", // red
  "rgba(245, 158, 11, 1)", // yellow
  "rgba(139, 92, 246, 1)", // purple
  "rgba(236, 72, 153, 1)", // pink
  "rgba(6, 182, 212, 1)", // cyan
  "rgba(249, 115, 22, 1)", // orange
];

export function ProductivityAllCharts({ data, legendBy = "Tech" }: ProductivityAllChartsProps) {
  const uniqueDates = useMemo(() => [...new Set(data.map((d) => d.BEGIN_TIME.split(" ")[0]))].sort(), [data]);
  const uniqueLegends = useMemo(
    () => [...new Set(data.map((d) => d[legendBy as keyof ChartDataItem]))].sort(),
    [data, legendBy],
  );

  const {
    payloadDatasets,
    trafficDatasets,
  }: {
    payloadDatasets: {
      label: string;
      data: (number | null)[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
      tension: number;
      pointRadius: number;
      pointHoverRadius: number;
      yAxisID: string;
      stack: string;
    }[];
    trafficDatasets: {
      label: string;
      data: (number | null)[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
      tension: number;
      pointRadius: number;
      pointHoverRadius: number;
      yAxisID: string;
      stack: string;
    }[];
  } = useMemo(() => {
    const payload: {
      label: string;
      data: (number | null)[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
      tension: number;
      pointRadius: number;
      pointHoverRadius: number;
      yAxisID: string;
      stack: string;
    }[] = [];
    const traffic: {
      label: string;
      data: (number | null)[];
      borderColor: string;
      backgroundColor: string;
      fill: boolean;
      tension: number;
      pointRadius: number;
      pointHoverRadius: number;
      yAxisID: string;
      stack: string;
    }[] = [];

    const isAllMode = legendBy.toLowerCase() === "all";

    // Prepare common props factory
    const buildCommonProps = (label: string, color: string) => ({
      label,
      borderColor: color,
      backgroundColor: color.replace("1)", "0.1)"),
      fill: true,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
    });

    if (isAllMode) {
      // Single dataset: sum all values per date, detect tech from first row
      const firstRowTech = data[0]?.Tech?.toLowerCase() ?? "2g";
      const is4G = firstRowTech === "4g";
      const color = colors[0];

      payload.push({
        ...buildCommonProps("Total", color),
        data: uniqueDates.map((date) => {
          const dayData = data.filter((d) => d.BEGIN_TIME.split(" ")[0] === date);
          const sum = dayData.reduce((acc, d) => acc + (d.TOTAL_PAYLOAD_GB ?? 0), 0);
          return sum || null;
        }),
        yAxisID: "y",
        stack: "stack-2g",
      });

      traffic.push({
        ...buildCommonProps("Total", color),
        data: uniqueDates.map((date) => {
          const dayData = data.filter((d) => d.BEGIN_TIME.split(" ")[0] === date);
          const sum = dayData.reduce((acc, d) => acc + (d.TOTAL_TRAFFIC_ERL ?? 0), 0);
          return sum || null;
        }),
        yAxisID: "y",
        stack: "stack-2g",
      });
    } else {
      // Per grouping (SITEID or Tech) dataset: sum values by date + group
      uniqueLegends.forEach((legendValue, index) => {
        const legendKey = legendBy as keyof ChartDataItem;
        const legendData = data.filter((d) => d[legendKey] === legendValue);
        const is4G = String(legendValue).toLowerCase() === "4g";
        const color = colors[index % colors.length];

        payload.push({
          ...buildCommonProps(String(legendValue), color),
          data: uniqueDates.map((date) => {
            const dayData = legendData.filter((d) => d.BEGIN_TIME.split(" ")[0] === date);
            const sum = dayData.reduce((acc, d) => acc + (d.TOTAL_PAYLOAD_GB ?? 0), 0);
            return sum || null;
          }),
          yAxisID: is4G ? "y1" : "y",
          stack: is4G ? "stack-4g" : "stack-2g",
        });

        traffic.push({
          ...buildCommonProps(String(legendValue), color),
          data: uniqueDates.map((date) => {
            const dayData = legendData.filter((d) => d.BEGIN_TIME.split(" ")[0] === date);
            const sum = dayData.reduce((acc, d) => acc + (d.TOTAL_TRAFFIC_ERL ?? 0), 0);
            return sum || null;
          }),
          yAxisID: is4G ? "y1" : "y",
          stack: is4G ? "stack-4g" : "stack-2g",
        });
      });
    }

    return { payloadDatasets: payload, trafficDatasets: traffic };
  }, [uniqueLegends, uniqueDates, data, legendBy]);

  const isTechMode = legendBy.toLowerCase() === "tech";

  const commonOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: { display: false },

        legend: {
          position: "top" as const,
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 11,
            },
          },
        },
        tooltip: {
          mode: "index" as const,
          intersect: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 90,
            minRotation: 90,
          },
        },
        y: {
          stacked: false,
          beginAtZero: false,
          position: "left" as const,
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
          ...(isTechMode && {
            title: {
              display: true,
              text: "2G & 5G",
            },
          }),
        },
        ...(isTechMode && {
          y1: {
            stacked: false,
            beginAtZero: false,
            position: "right" as const,
            grid: {
              drawOnChartArea: false,
            },
            title: {
              display: true,
              text: "4G",
            },
          },
        }),
      },
      interaction: {
        mode: "nearest" as const,
        axis: "x" as const,
        intersect: false,
      },
    }),
    [isTechMode],
  );

  const payloadChartData = {
    labels: uniqueDates,
    datasets: payloadDatasets,
  };

  const trafficChartData = {
    labels: uniqueDates,
    datasets: trafficDatasets,
  };

  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-gray-500">No data available</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Payload Chart */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-center text-lg font-semibold text-gray-700">Total Payload (GB)</h3>
        <div className="h-72">
          <Line data={payloadChartData} options={commonOptions} />
        </div>
      </div>

      {/* Traffic Chart */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-center text-lg font-semibold text-gray-700">Total Traffic (Erlang)</h3>
        <div className="h-72">
          <Line data={trafficChartData} options={commonOptions} />
        </div>
      </div>
    </div>
  );
}

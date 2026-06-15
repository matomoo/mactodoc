"use client";

// biome-ignore assist/source/organizeImports: <none>
import { chartJsV1Settings } from "@/app/(project)/mdoc/def/chartjs-setting";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

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
}

export default function ChartPayloadThpUser({ data, sector }: ChartPayloadThpUserProps) {
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
    order: 2,
  };

  // THP as line chart (orange)
  const thpDataset = {
    type: "line" as const,
    label: "PDCP Thp (Mbps)",
    data: uniqueDates.map((date) => {
      const item = sortedData.find((d) => d.begin_time === date);
      return item?.max_cell_pdcp_thp_mbps ?? 0;
    }),
    borderColor: "hsl(38, 92%, 50%)",
    backgroundColor: "hsl(38, 92%, 50%)",
    yAxisID: "y1",
    fill: false,
    tension: 0.3,
    pointRadius: 0,
    borderWidth: 3,
    order: 0,
  };

  // RRC Users as line chart (gray)
  const rrcDataset = {
    type: "line" as const,
    label: "RRC Users",
    data: uniqueDates.map((date) => {
      const item = sortedData.find((d) => d.begin_time === date);
      return item?.max_rrc_con_user_number ?? 0;
    }),
    borderColor: "hsl(220, 9%, 46%)",
    backgroundColor: "hsl(220, 9%, 46%)",
    yAxisID: "y1",
    fill: false,
    tension: 0.3,
    borderWidth: 3,
    pointRadius: 0,
    order: 1,
  };

  const chartData = {
    labels,
    datasets: [payloadDataset, thpDataset, rrcDataset],
  };

  const options = {
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
            if (label.includes("Payload")) {
              return `${label}: ${value.toFixed(2)} GB`;
            }
            if (label.includes("PDCP")) {
              return `${label}: ${value.toFixed(2)} Mbps`;
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
    },
  };

  return (
    <div className="mt-12 h-96 w-250">
      <div className="font-bold text-lg">Sector {sector.slice(7, 20)}</div>
      <Chart type="bar" data={chartData} options={options as never} />
    </div>
  );
}

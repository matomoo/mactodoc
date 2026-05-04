/** biome-ignore-all lint/suspicious/noExplicitAny: <none> */
"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart } from "react-chartjs-2";
import { useSummaryStore } from "@/stores/summaryStore";
import {
  chartJsColors,
  chartJsColorsTransparent,
  chartJsV1Settings,
  // hexToRGBA,
} from "../contexts/chartjs/chartjs-settings";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  ChartLegend,
  ChartDataLabels,
);

interface ApiDataItem {
  month_day: string;
  year: string;
  total_payload: number;
  ytd_percentage_vs_prev_year: number | null;
}

interface IProps {
  productivityApiPath: string;
  productivityLevel: string;
  productivityLocation: string;
  title: string;
}

export default function ProductivityDetailChartContent({
  productivityApiPath,
  productivityLevel,
  title = "NoTitle",
}: IProps) {
  const { yearweek, viewBy, nop, region, kabupaten, kecamatan, dateRange2 } = useSummaryStore();

  const valueLocation =
    viewBy === "region" ? region : viewBy === "nop" ? nop : viewBy === "kabupaten" ? kabupaten : kecamatan;

  const {
    data: productivityData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "productivity-detail-chart-content",
      yearweek,
      productivityApiPath,
      productivityLevel,
      valueLocation,
      dateRange2,
      viewBy,
    ],
    queryFn: async () => {
      if (!productivityApiPath || productivityApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [
          `${productivityApiPath}-detail-chart?level=${viewBy}`,
          `valueLocation=${valueLocation}`,
          `yearweek=${yearweek}`,
          `yearweek=${yearweek}`,
          `tgl_1=${dateRange2?.split("|")[0]}`,
          `tgl_2=${dateRange2?.split("|")[1]}`,
        ].join("&"),
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Handle API response format with rows property
      const dataArray = result.rows || result || [];

      return dataArray as ApiDataItem[];
    },
    enabled: !!(productivityApiPath && productivityApiPath !== "noUrl"),
  });

  const dataForChart = productivityData || [];

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  if (dataForChart.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p>No data available</p>
      </div>
    );
  }

  const years = [...new Set(dataForChart.map((item) => item.year))];
  const labels = [...new Set(dataForChart.map((item) => item.month_day))];

  const lineDatasets = years.map((year) => {
    const yearData = dataForChart.filter((item) => item.year === year);
    const data = labels.map((label) => {
      const item = yearData.find((d) => d.month_day === label);
      return item?.total_payload ?? null;
    });

    const color = chartJsColors[parseInt(year + 13, 10) % chartJsColors.length];
    const colorBg = chartJsColorsTransparent[parseInt(year + 13, 10) % chartJsColors.length];

    return {
      type: "line" as const,
      label: `Total Payload ${year}`,
      data,
      borderColor: color,
      backgroundColor: colorBg,
      borderWidth: 3.5,
      yAxisID: "y",
      tension: 0.3,
      pointRadius: 0,
      fill: false,
      datalabels: {
        display: false,
      },
    };
  });

  const barDatasets = years
    .filter((year) => year === "2026")
    .map((year) => {
      const yearData = dataForChart.filter((item) => item.year === year);
      const data = labels.map((label) => {
        const item = yearData.find((d) => d.month_day === label);
        return item?.ytd_percentage_vs_prev_year ?? null;
      });
      const color = chartJsColors[parseInt(year + 13, 10) % chartJsColors.length];
      const colorBg = chartJsColorsTransparent[parseInt(year + 13, 10) % chartJsColors.length];

      return {
        type: "line" as const,
        label: `YTD % vs Prev Year ${year}`,
        data,
        backgroundColor: colorBg,
        borderColor: color,
        yAxisID: "y1",
        // barPercentage: 1.3,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
        fill: false,
        datalabels: {
          display: false,
        },
      };
    });

  const chartData = {
    labels,
    datasets: [...lineDatasets, ...barDatasets],
  } as any;

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        onClick: () => null,
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
      tooltip: {
        mode: "index" as const,
        callbacks: {
          label: (context: any) => {
            if (context.dataset.yAxisID === "y1") {
              return `${context.dataset.label}: ${context.raw}%`;
            }
            return `${context.dataset.label}: ${new Intl.NumberFormat("en-US", {
              notation: "standard",
              compactDisplay: "short",
              maximumFractionDigits: 2,
            }).format(context.raw)} GB`;
          },
        },
      },
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
      },
    },
    scales: {
      x: {
        grid: {
          offset: false, // Remove offset grid
          display: false,
        },
        title: {
          display: false,
          text: "Month-Day",
        },
        ticks: {
          maxRotation: 90,
          minRotation: 90,
        },
      },
      y: {
        ticks: {
          font: {
            // size: chartJsV1Settings.yAxisTickFontSize,
          },
          callback: (value: any) => {
            if (typeof value === "number") {
              return new Intl.NumberFormat("en-US", {
                notation: "compact",
                compactDisplay: "short",
                maximumFractionDigits: 2,
              }).format(value);
            }
            return value;
          },
        },
        grid: {
          offset: false, // Remove offset grid
          display: false,
        },
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Total Payload",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "YTD % vs Prev Year",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const newTitle = title === "Productivity Detail Chart - Payload" ? "PAYLOAD YTD" : "";

  return (
    <div className="h-full space-y-6 overflow-x-auto">
      <div className="font-semibold text-lg">
        {newTitle} - {viewBy?.toUpperCase() ?? ""} - {valueLocation}
      </div>
      <Chart type="line" data={chartData} options={chartOptions} />
    </div>
  );
}

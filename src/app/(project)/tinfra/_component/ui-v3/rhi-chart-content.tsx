"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import { Badge } from "@/components/ui/badge";
import { useSummaryStore } from "@/stores/summaryStore";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, ChartLegend, ChartDataLabels);

interface ChartDataItem {
  percent_rhi_all: number;
  year_week: number;
}

interface RhiChartContentProps {
  rhiApiPath: string;
  rhiLevel: string;
  rhiLocation: string;
}

export default function RhiChartContent({ rhiApiPath, rhiLevel, rhiLocation }: RhiChartContentProps) {
  const { yearweek, viewBy, nop, region, kabupaten, kecamatan } = useSummaryStore();

  const valueLocation =
    viewBy === "region" ? region : viewBy === "nop" ? nop : viewBy === "kabupaten" ? kabupaten : kecamatan;

  const {
    data: rawData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rhi-data", yearweek, rhiApiPath, rhiLevel, valueLocation],
    queryFn: async () => {
      if (!rhiApiPath || rhiApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [
          `${rhiApiPath}?level=${viewBy}`,
          `valueLocation=${valueLocation}`,
          `yearweek=${yearweek}`,
          `fieldToAggregate=${viewBy}`,
        ].join("&"),
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Handle API response format with rows property
      const dataArray = result.rows || result || [];

      return dataArray.map((item: any) => ({
        ...item,
        avg_percentage: parseFloat(item.avg_percentage),
        target_kpi: parseFloat(item.target_kpi),
        total_win: parseInt(item.total_win, 10),
        total_lose: parseInt(item.total_lose, 10),
        wow_current_pct: item.wow_current_pct ? parseFloat(item.wow_current_pct) : null,
        wow_prev_pct: item.wow_prev_pct ? parseFloat(item.wow_prev_pct) : null,
        wow_diff: item.wow_diff ? parseFloat(item.wow_diff) : null,
        current_rank: parseInt(item.current_rank, 10),
        prev_rank: item.prev_rank ? parseInt(item.prev_rank, 10) : null,
      }));
    },
    enabled: !!(rhiApiPath && rhiApiPath !== "noUrl"),
  });

  // for chart rhi percentage
  const {
    data: rhiPercentageData,
    isLoading: rhiPercentageLoading,
    error: rhiPercentageError,
  } = useQuery({
    queryKey: ["rhi-data-all", yearweek, rhiApiPath, rhiLevel, valueLocation],
    queryFn: async () => {
      if (!rhiApiPath || rhiApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [
          `${rhiApiPath}?level=${viewBy}`,
          `valueLocation=${valueLocation}`,
          `yearweek=All`,
          `fieldToAggregate=${viewBy}`,
        ].join("&"),
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Handle API response format with rows property
      const dataArray = result.rows || result || [];

      return dataArray.map((item: any) => ({
        ...item,
      }));
    },
    enabled: !!(rhiApiPath && rhiApiPath !== "noUrl"),
  });

  const data = rawData || [];

  console.log("Debug", { data, rhiPercentageData });

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

  if (data.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p>No data available</p>
      </div>
    );
  }

  // Group data by metric for separate charts
  const groupedData = (Array.isArray(data) ? data : []).reduce(
    (acc, item) => {
      if (!acc[item.metric]) {
        acc[item.metric] = [];
      }
      acc[item.metric].push({
        provider: item.provider,
        avg_percentage: item.avg_percentage,
        rank_remark: item.rank_remark,
        wow_diff: item.wow_diff,
      });
      return acc;
    },
    {} as Record<string, ChartDataItem[]>,
  );

  return (
    <div className="flex flex-row gap-6 overflow-x-auto">
      {Object.entries(groupedData).map(([metric, chartData]) => {
        const chartOptions = {
          indexAxis: "y" as const,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context: any) => `${context.parsed.x.toFixed(2)}%`,
              },
            },
            datalabels: {
              anchor: "center" as const,
              align: "center" as const,
              color: "#ffffff",
              font: {
                weight: "bold" as const,
                size: 11,
              },
              formatter: (value: number) => `${value.toFixed(2)}%`,
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              display: false,
              title: {
                display: false,
                text: "Average Percentage (%)",
              },
            },
            y: {
              title: {
                display: false,
                text: "Provider",
              },
            },
          },
        };

        return (
          <div key={metric} className="shrink-0 space-y-2" style={{ minWidth: "300px" }}>
            {/* Percentage */}
            <div>{data && <div className="text-7xl">{parseFloat(data[0].percent_rhi_all).toFixed(2)}</div>}</div>
            {/* Chart of percent_rhi_all, get data from api2 */}
          </div>
        );
      })}
    </div>
  );
}

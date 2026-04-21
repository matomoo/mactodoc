/** biome-ignore-all lint/suspicious/noExplicitAny: <none> */
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

// Define metric name mapping for new API structure
const getMetricDisplayName = (metric: string): string => {
  const metricMap: { [key: string]: string } = {
    avg_connectivity_score: "Connectivity Score",
    avg_speed_score: "Speed Score",
    avg_video_score: "Video Score",
    avg_game_score: "Game Score",
    avg_web_score: "Web Score",
    avg_page_load_time_percent: "Page Load Time %",
    avg_web_page_load_time: "Web Page Load Time",
  };
  return metricMap[metric] || metric;
};

// Define KPI columns to chart
const getKpiColumns = (): string[] => {
  return [
    "avg_connectivity_score",
    "avg_speed_score",
    "avg_video_score",
    "avg_game_score",
    "avg_web_score",
    "avg_page_load_time_percent",
    "avg_web_page_load_time",
  ];
};

// Define colors for specific providers
const getProviderColor = (providerName: string): string => {
  const provider = providerName.toLowerCase();
  if (provider === "telkomsel") {
    return "rgba(255, 0, 37, 1)"; // Red
  }
  if (provider === "indosat") {
    return "rgba(255, 206, 86, 1)"; // Yellow
  }
  if (provider === "xl" || provider === "xl axiata") {
    return "rgba(54, 162, 235, 1)"; // Blue
  }
  // Default colors for other providers
  const defaultColors = [
    "rgba(75, 192, 192, 1)", // Green
    "rgba(153, 102, 255, 1)", // Purple
    "rgba(255, 159, 64, 1)", // Orange
  ];
  const index = provider.charCodeAt(0) % defaultColors.length;
  return defaultColors[index];
};

interface ChartDataItem {
  provider: string;
  value: number;
  wow_diff: number | null;
  rank: number | null;
  tech: string | null;
}

interface TechGroupedData {
  [tech: string]: ChartDataItem[];
}

interface ApiDataItem {
  operator: string;
  avg_connectivity_score: string | null;
  avg_speed_score: string | null;
  avg_video_score: string | null;
  avg_game_score: string | null;
  avg_web_score: string | null;
  avg_page_load_time_percent: string | null;
  avg_web_page_load_time: string | null;
  wow_connectivity_score: string | null;
  wow_speed_score: string | null;
  wow_video_score: string | null;
  wow_game_score: string | null;
  wow_web_score: string | null;
  avg_rank_connectivity: string | null;
  avg_rank_speed: string | null;
  avg_rank_video: string | null;
  avg_rank_game: string | null;
  avg_rank_web: string | null;
  tech: string | null;
}

interface IProps {
  ooklaApiPath: string;
  ooklaLevel: string;
  ooklaLocation: string;
}

export default function OoklaChartContent({ ooklaApiPath, ooklaLevel }: IProps) {
  const { yearweek, viewBy, nop, region, kabupaten, kecamatan } = useSummaryStore();

  const valueLocation =
    viewBy === "region" ? region : viewBy === "nop" ? nop : viewBy === "kabupaten" ? kabupaten : kecamatan;

  const {
    data: rawData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ookla-data", yearweek, ooklaApiPath, ooklaLevel, valueLocation],
    queryFn: async () => {
      if (!ooklaApiPath || ooklaApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [`${ooklaApiPath}?level=${viewBy}`, `&valueLocation=${valueLocation}`, `&yearweek=${yearweek}`].join("&"),
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Handle API response format with rows property
      const dataArray = result.rows || result || [];

      return dataArray as ApiDataItem[];
    },
    enabled: !!(ooklaApiPath && ooklaApiPath !== "noUrl"),
  });

  const data = rawData || [];

  // console.log("debug:", { data });

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

  // Group data by KPI -> tech -> provider structure
  const groupedData = (Array.isArray(data) ? data : []).reduce(
    (acc, item: ApiDataItem) => {
      const kpiColumns = getKpiColumns();

      kpiColumns.forEach((kpiColumn) => {
        const value = item[kpiColumn as keyof ApiDataItem];
        if (value !== null && value !== undefined && value !== "") {
          if (!acc[kpiColumn]) {
            acc[kpiColumn] = {} as TechGroupedData;
          }

          const tech = item.tech || "ALL";
          if (!acc[kpiColumn][tech]) {
            acc[kpiColumn][tech] = [];
          }

          // Get corresponding WOW and rank values
          const wowColumn = kpiColumn.replace("avg_", "wow_");
          const rankColumn = kpiColumn.replace("avg_", "avg_rank_").replace("_score", "");

          acc[kpiColumn][tech].push({
            provider: item.operator,
            value: parseFloat(value),
            wow_diff: item[wowColumn as keyof ApiDataItem]
              ? parseFloat(item[wowColumn as keyof ApiDataItem] as string)
              : null,
            rank: item[rankColumn as keyof ApiDataItem]
              ? parseInt(item[rankColumn as keyof ApiDataItem] as string, 10)
              : null,
            tech: item.tech,
          });
        }
      });

      return acc;
    },
    {} as Record<string, TechGroupedData>,
  );

  // Define chart options outside return for better performance
  const getChartOptions = () => ({
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
          label: (context: any) => {
            const value = context.parsed.x;
            const metric = context.dataset.label || "";
            if (metric.includes("%")) {
              return `${value.toFixed(2)}%`;
            }
            if (metric.includes("Time")) {
              return `${value.toFixed(2)} ms`;
            }
            return value.toFixed(2);
          },
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
        formatter: (value: number, context: any) => {
          const metric = context.dataset.label || "";
          if (metric.includes("%")) {
            return `${value.toFixed(2)}%`;
          }
          if (metric.includes("Time")) {
            return `${value.toFixed(0)}`;
          }
          return value.toFixed(1);
        },
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
  });

  return (
    <div className="flex shrink-0 flex-row gap-6 space-x-2 overflow-x-auto" style={{ minWidth: "300px" }}>
      {Object.entries(groupedData).map(([metric, techData]) => (
        <div key={metric} className="space-y-2">
          <h2 className="font-semibold text-gray-800 text-lg">{getMetricDisplayName(metric)}</h2>
          <div className="flex gap-4">
            {Object.entries(techData as TechGroupedData).map(([tech, chartData]) => {
              const chartOptions = getChartOptions();

              // Sort data by value descending so highest values appear at top
              const sortedChartData = [...(chartData as ChartDataItem[])].sort((a, b) => b.value - a.value);

              const chartDataForChart = {
                labels: sortedChartData.map((item) => item.provider),
                datasets: [
                  {
                    label: getMetricDisplayName(metric),
                    data: sortedChartData.map((item) => Number(item.value)),
                    backgroundColor: sortedChartData.map((item) => getProviderColor(item.provider)),
                    borderColor: sortedChartData.map((item) => getProviderColor(item.provider)),
                    borderWidth: 1,
                  },
                ],
              };

              return (
                <div key={tech} className="space-y-2">
                  <h3 className="font-medium text-gray-700 text-sm">Tech: {tech}</h3>
                  <div className="h-[100px] w-[200px]">
                    <Bar data={chartDataForChart} options={chartOptions} />
                  </div>
                  <div>
                    {sortedChartData && sortedChartData.find((item) => item.wow_diff !== null)?.wow_diff !== null && (
                      <Badge
                        className={
                          (sortedChartData.find((item) => item.provider === "Telkomsel")?.wow_diff ?? 0) > 0
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }
                      >
                        WOW{" "}
                        {sortedChartData.find((item) => item.provider === "Telkomsel")?.wow_diff?.toFixed(2) || "N/A"}
                        {metric.includes("%") ? "%" : ""}
                      </Badge>
                    )}
                    {sortedChartData &&
                      sortedChartData.find((item) => item.provider === "Telkomsel")?.rank !== null && (
                        <div className="mt-1 text-gray-600 text-sm">
                          Rank: {sortedChartData.find((item) => item.provider === "Telkomsel")?.rank || "N/A"}
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

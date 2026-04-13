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

// Define metric name mapping
const getMetricDisplayName = (metric: string): string => {
  const metricMap: { [key: string]: string } = {
    consistentquality_overall: "Consistent Quality Overall",
    download_5g: "Download 5G",
    download_overall: "Download Overall",
    gamesexperience_5g: "Games Experience 5G",
    gamesexperience_overall: "Games Experience Overall",
    onxcoveragesim_5g: "On Xcoverage Sim 5G",
    onxcoveragesim_overall: "On Xcoverage Sim Overall",
    reliability_overall: "Reliability Overall",
    timeon_5g: "Time On 5G",
    timeon_overall: "Time On Overall",
    upload_5g: "Upload 5G",
    upload_overall: "Upload Overall",
    videoexperience_5g: "Video Experience 5G",
    videoexperience_overall: "Video Experience Overall",
    voiceexperience_5g: "Voice Experience 5G",
    voiceexperience_overall: "Voice Experience Overall",
  };
  return metricMap[metric] || metric;
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
  avg_percentage: number;
  wow_diff: number;
  rank_remark: string;
}

interface TutelaChartContentProps {
  tutelaApiPath: string;
  tutelaLevel: string;
  tutelaLocation: string;
}

export default function TutelaChartContent({ tutelaApiPath, tutelaLevel }: TutelaChartContentProps) {
  const { yearweek, viewBy, nop, region, kabupaten, kecamatan } = useSummaryStore();

  const valueLocation =
    viewBy === "region" ? region : viewBy === "nop" ? nop : viewBy === "kabupaten" ? kabupaten : kecamatan;

  const {
    data: rawData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tutela-data", yearweek, tutelaApiPath, tutelaLevel, valueLocation],
    queryFn: async () => {
      if (!tutelaApiPath || tutelaApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [`${tutelaApiPath}?level=${viewBy}`, `&location=${valueLocation}`, `&yearweek=${yearweek}`].join("&"),
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
    enabled: !!(tutelaApiPath && tutelaApiPath !== "noUrl"),
  });

  const data = rawData || [];

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

        // Sort data by avg_percentage descending so highest values appear at top
        const sortedChartData = [...(chartData as ChartDataItem[])].sort((a, b) => b.avg_percentage - a.avg_percentage);

        const chartDataForChart = {
          labels: sortedChartData.map((item) => item.provider),
          datasets: [
            {
              label: "Avg %",
              data: sortedChartData.map((item) => Number(item.avg_percentage.toFixed(2))),
              backgroundColor: sortedChartData.map((item) => getProviderColor(item.provider)),
              borderColor: sortedChartData.map((item) => getProviderColor(item.provider)),
              borderWidth: 1,
            },
          ],
        };

        return (
          <div key={metric} className="shrink-0 space-y-2" style={{ minWidth: "300px" }}>
            <h3 className="font-medium text-gray-700 text-sm">{getMetricDisplayName(metric)}</h3>
            <div style={{ height: "150px" }}>
              <Bar data={chartDataForChart} options={chartOptions} />
            </div>
            <div>
              {sortedChartData && (
                <Badge
                  className={
                    (sortedChartData.find((item) => item.provider === "Telkomsel")?.wow_diff ?? 0) > 0
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }
                >
                  {" "}
                  WOW {sortedChartData.filter((item) => item.provider === "Telkomsel")[0].wow_diff.toFixed(2)}%
                </Badge>
              )}
              {sortedChartData && (
                <div>{sortedChartData.filter((item) => item.provider === "Telkomsel")[0].rank_remark}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

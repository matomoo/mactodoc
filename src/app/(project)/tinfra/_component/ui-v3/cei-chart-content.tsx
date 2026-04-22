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
import { Bar, Line } from "react-chartjs-2";
import { Badge } from "@/components/ui/badge";
import { useSummaryStore } from "@/stores/summaryStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, ChartLegend, ChartDataLabels);

// Define KPI columns to chart
const getKpiColumns = (): string[] => {
  return [
    "good_cells_pct",
    // "pct_achv_p1"
  ];
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
  yearweek: number;
  prev_yearweek: number;
  region: string;
  green_count: string;
  investment_count: string;
  operation_count: string;
  optim_count: string;
  vendor_count: string;
  total_simplify_remark: string;
  pct_achv_rci: string;
  prev_pct_achv_rci: string;
  wow_pct_achv_rci: string;
  unbalanced_p1_count: string;
  total_unbalanced_3method: string;
  pct_achv_p1: string;
  prev_pct_achv_p1: string;
  wow_pct_achv_p1: string;
}

interface IProps {
  ceiApiPath: string;
  ceiLevel: string;
  ceiLocation: string;
}

export default function CeiChartContent({ ceiApiPath, ceiLevel }: IProps) {
  const { yearweek, viewBy, nop, region, kabupaten, kecamatan } = useSummaryStore();

  const valueLocation =
    viewBy === "region" ? region : viewBy === "nop" ? nop : viewBy === "kabupaten" ? kabupaten : kecamatan;

  const {
    data: rciData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cei-data-achv", yearweek, ceiApiPath, ceiLevel, valueLocation],
    queryFn: async () => {
      if (!ceiApiPath || ceiApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [`${ceiApiPath}-achv?level=${viewBy}`, `valueLocation=${valueLocation}`, `yearweek=${yearweek}`].join("&"),
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Handle API response format with rows property
      const dataArray = result.rows || result || [];

      return dataArray as ApiDataItem[];
    },
    enabled: !!(ceiApiPath && ceiApiPath !== "noUrl"),
  });

  const {
    data: ceiChartData,
    // isLoading:rciChartLoading,
    // error,
  } = useQuery({
    queryKey: ["cei-data-chart", yearweek, ceiApiPath, ceiLevel, valueLocation],
    queryFn: async () => {
      if (!ceiApiPath || ceiApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [`${ceiApiPath}-chart?level=${viewBy}`, `&valueLocation=${valueLocation}`, `&yearweek=${yearweek}`].join("&"),
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Handle API response format with rows property
      const dataArray = result.rows || result || [];

      return dataArray as ApiDataItem[];
    },
    enabled: !!(ceiApiPath && ceiApiPath !== "noUrl"),
  });

  const data = rciData || [];
  const ceiChart = ceiChartData || [];

  // console.log("debug:", { data, ceiChart });

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

  // Group data by KPI for new aggregated structure
  const groupedData = (Array.isArray(data) ? data : []).reduce(
    (acc, item: ApiDataItem) => {
      const kpiColumns = getKpiColumns();

      kpiColumns.forEach((kpiColumn) => {
        const value = item[kpiColumn as keyof ApiDataItem];
        if (value !== null && value !== undefined && value !== "") {
          if (!acc[kpiColumn]) {
            acc[kpiColumn] = {} as TechGroupedData;
          }

          // Use "ALL" as tech since data is aggregated
          const tech = "ALL";
          if (!acc[kpiColumn][tech]) {
            acc[kpiColumn][tech] = [];
          }

          // Get corresponding WOW value
          const wowColumn = `wow_${kpiColumn}`;

          acc[kpiColumn][tech].push({
            provider: item.region, // Use region as provider name
            value: parseFloat(String(value)),
            wow_diff: item[wowColumn as keyof ApiDataItem]
              ? parseFloat(String(item[wowColumn as keyof ApiDataItem]))
              : null,
            rank: null, // No rank data in new structure
            tech: tech,
          });
        }
      });

      return acc;
    },
    {} as Record<string, TechGroupedData>,
  );

  const currentWeekIndex = ceiChart?.findIndex(
    (item: any) => item.weeknum === yearweek || item.weeknum === String(yearweek),
  );

  const lineChartData = {
    labels: ceiChart?.map((item: any) => item.weeknum) || [],
    datasets: [
      {
        label: "CEI Percentage",
        data: ceiChart?.map((item: any) => parseFloat(item.good_cells_pct)) || [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,

        // Per-point radius — current week gets bigger dot
        pointRadius: ceiChart?.map((_: any, i: number) => (i === currentWeekIndex ? 4 : 0)) || [],

        // Per-point color — current week gets accent color
        pointBackgroundColor:
          ceiChart?.map((_: any, i: number) => (i === currentWeekIndex ? "rgb(75, 192, 192)" : "rgb(75, 192, 192)")) ||
          [],

        // Border around the current week dot
        pointBorderColor:
          ceiChart?.map((_: any, i: number) => (i === currentWeekIndex ? "rgb(75, 192, 192)" : "rgb(75, 192, 192)")) ||
          [],

        pointHoverRadius: 3,
        datalabels: {
          display: false,
        },
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y.toFixed(2)}%`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: false,
          text: "Year Week",
        },
        ticks: {
          display: true, // Hide x-axis labels
        },
        grid: {
          display: true,
        },
      },
      y: {
        display: true,
        beginAtZero: false,
        title: {
          display: false,
          text: "CEI Percentage (%)",
        },
        ticks: {
          display: true,
          // callback: (value: any) => `${value}%`,
        },
        grid: {
          display: false,
        },
      },
    },
  };
  // console.log("debug", { groupedData });

  return (
    <div className="space-y-2">
      {Object.entries(groupedData).map(([metric, techData]) => (
        <div key={metric} className="flex flex-row items-center lg:overflow-x-auto">
          {/* Column 1: Value */}
          <div>
            {techData && (
              <h3
                className="text-6xl"
                style={{
                  fontSize: "3.2rem",
                  lineHeight: "1.1",
                  fontWeight: "bold",
                }}
              >
                {parseFloat(techData.ALL[0].value.toString()).toFixed(2)}
              </h3>
            )}
            {techData && (
              <Badge
                className={
                  (techData.ALL[0].wow_diff ?? 0) > 0
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    : "bg-red-100 text-red-800 hover:bg-red-200"
                }
              >
                {" "}
                WOW {parseFloat((techData.ALL[0].wow_diff ?? 0).toString()).toFixed(2)}%
              </Badge>
            )}
          </div>
          {/* Chart of percent_rhi_all, get data from rhiPercentageData */}
          {/* here column 2 and 3 */}
          <div className="col-span-2" style={{ width: "280px", height: "200px" }}>
            {ceiChart && ceiChart.length > 0 ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">No RHI percentage data available</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

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
    "pct_achv_rci",
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
  rciApiPath: string;
  rciLevel: string;
  rciLocation: string;
}

export default function RciChartContent({ rciApiPath, rciLevel }: IProps) {
  const { yearweek, viewBy, nop, region, kabupaten, kecamatan } = useSummaryStore();

  const valueLocation =
    viewBy === "region" ? region : viewBy === "nop" ? nop : viewBy === "kabupaten" ? kabupaten : kecamatan;

  const {
    data: rciData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rci-data", yearweek, rciApiPath, rciLevel, valueLocation],
    queryFn: async () => {
      if (!rciApiPath || rciApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [`${rciApiPath}?level=${viewBy}`, `&valueLocation=${valueLocation}`, `&yearweek=${yearweek}`].join("&"),
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Handle API response format with rows property
      const dataArray = result.rows || result || [];

      return dataArray as ApiDataItem[];
    },
    enabled: !!(rciApiPath && rciApiPath !== "noUrl"),
  });

  const {
    data: rciChartData,
    // isLoading:rciChartLoading,
    // error,
  } = useQuery({
    queryKey: ["rci-data-chart", yearweek, rciApiPath, rciLevel, valueLocation],
    queryFn: async () => {
      if (!rciApiPath || rciApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [`${rciApiPath}-chart?level=${viewBy}`, `&valueLocation=${valueLocation}`, `&yearweek=${yearweek}`].join("&"),
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Handle API response format with rows property
      const dataArray = result.rows || result || [];

      return dataArray as ApiDataItem[];
    },
    enabled: !!(rciApiPath && rciApiPath !== "noUrl"),
  });

  const data = rciData || [];
  const rciChart = rciChartData || [];

  console.log("debug:", { data, rciChart });

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

  // Prepare data for line chart
  const lineChartData = {
    labels: rciChart?.map((item: any) => item.yearweek) || [],
    datasets: [
      {
        label: "RCI Percentage",
        data: rciChart?.map((item: any) => parseFloat(item.pct_achv_rci)) || [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        pointRadius: 2,
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
        beginAtZero: true,
        title: {
          display: false,
          text: "RHI Percentage (%)",
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
        <div key={metric} className="flex flex-row items-center">
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
          <div className="col-span-2" style={{ height: "200px" }}>
            {rciChart && rciChart.length > 0 ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">No RHI percentage data available</p>
              </div>
            )}
          </div>
        </div>
      ))}
      {/* here is span 3 col */}
      {data && (
        <div className="col-span-3">
          {/* generate table shadcn with data from rhiWowData, column region, mostly_kpi_fail_2g,mostly_kpi_fail_4g,mostly_kpi_fail_5g */}
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Remark</TableHead>
                <TableHead className="text-xs">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow key={"green"}>
                <TableCell className="py-1 text-xs">GREEN</TableCell>
                {data.map((item: any) => (
                  <TableCell key={`green-${item.provider}`} className="py-1 text-xs">
                    {item.green_count}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow key={"investment"}>
                <TableCell className="py-1 text-xs">INVESTMENT</TableCell>
                {data.map((item: any) => (
                  <TableCell key={`investment-${item.provider}`} className="py-1 text-xs">
                    {item.investment_count}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow key={"operation"}>
                <TableCell className="py-1 text-xs">OPERATION</TableCell>
                {data.map((item: any) => (
                  <TableCell key={`operation-${item.provider}`} className="py-1 text-xs">
                    {item.operation_count}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow key={"optimization"}>
                <TableCell className="py-1 text-xs">OPTIM</TableCell>
                {data.map((item: any) => (
                  <TableCell key={`optim-${item.provider}`} className="py-1 text-xs">
                    {item.optim_count}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow key={"vendor"}>
                <TableCell className="py-1 text-xs">Vendor</TableCell>
                {data.map((item: any) => (
                  <TableCell key={`vendor-${item.provider}`} className="py-1 text-xs">
                    {item.vendor_count}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

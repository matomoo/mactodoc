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
    // "pct_achv_rci",
    "pct_achv_unbalance_p1",
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
  balanced_count: string;
  unbalanced_p1_count: string;
  unbalanced_p2_count: string;
  unbalanced_p3_count: string;
  wow_pct_achv_balanced: string;
  wow_pct_achv_unbalance_p1: string;
  wow_pct_achv_unbalance_p2: string;
  wow_pct_achv_unbalance_p3: string;
  total_unbalanced_3method: string;
  p1_unbalance_v2_l18l21_vs_l23: string;
  p1_unbalance_v1_l18l21: string;
  p1_unbalance_v3_thp_l9: string;
  p1_unbalance_v2_l18l21_40: string;

  pct_achv_balanced: string;
  prev_pct_achv_p1: string;
  wow_pct_achv_p1: string;
}

interface IProps {
  unbalanceApiPath: string;
  unbalanceLevel: string;
  unbalanceLocation: string;
}

export default function UnbalanceChartContent({ unbalanceApiPath, unbalanceLevel, unbalanceLocation }: IProps) {
  const { yearweek, viewBy, nop, region, kabupaten, kecamatan } = useSummaryStore();

  const valueLocation =
    viewBy === "region" ? region : viewBy === "nop" ? nop : viewBy === "kabupaten" ? kabupaten : kecamatan;

  const {
    data: unbalanceData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["unbalance-data", yearweek, unbalanceApiPath, unbalanceLevel, valueLocation],
    queryFn: async () => {
      if (!unbalanceApiPath || unbalanceApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [`${unbalanceApiPath}?level=${viewBy}`, `&valueLocation=${valueLocation}`, `&yearweek=${yearweek}`].join("&"),
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Handle API response format with rows property
      const dataArray = result.rows || result || [];

      return dataArray as ApiDataItem[];
    },
    enabled: !!(unbalanceApiPath && unbalanceApiPath !== "noUrl"),
  });

  const {
    data: unbalanceChartData,
    // isLoading:rciChartLoading,
    // error,
  } = useQuery({
    queryKey: ["unbalance-data-chart", yearweek, unbalanceApiPath, unbalanceLevel, valueLocation],
    queryFn: async () => {
      if (!unbalanceApiPath || unbalanceApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [`${unbalanceApiPath}-chart?level=${viewBy}`, `&valueLocation=${valueLocation}`, `&yearweek=${yearweek}`].join(
          "&",
        ),
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Handle API response format with rows property
      const dataArray = result.rows || result || [];

      return dataArray as ApiDataItem[];
    },
    enabled: !!(unbalanceApiPath && unbalanceApiPath !== "noUrl"),
  });

  const data = unbalanceData || [];
  const unbalanceChart = unbalanceChartData || [];

  // console.log("debug:", { data, unbalanceChart });

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
    labels: unbalanceChart?.map((item: any) => item.yearweek) || [],
    datasets: [
      {
        label: "Unbalance Percentage",
        data: unbalanceChart?.map((item: any) => parseFloat(item.pct_achv_p1)) || [],
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
            {unbalanceChart && unbalanceChart.length > 0 ? (
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
        <div className="col-span-3 h-32 overflow-y-auto">
          {/* generate table shadcn with data from rhiWowData, column region, mostly_kpi_fail_2g,mostly_kpi_fail_4g,mostly_kpi_fail_5g */}
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Remark</TableHead>
                <TableHead className="text-xs">Count</TableHead>
                <TableHead className="text-xs">WOW</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow key={"balanced"}>
                <TableCell className="py-1 text-xs">Balanced</TableCell>
                {data.map((item: any) => (
                  <TableCell key={`balanced-${item.provider}`} className="py-1 text-xs">
                    {item.balanced_count}
                  </TableCell>
                ))}
                {data.map((item: any) => (
                  <TableCell key={`balanced-${item.provider}`} className="py-1 text-xs">
                    {parseFloat(item.wow_pct_achv_balanced.toString()).toFixed(2)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow key={"unbalanced_p1"}>
                <TableCell className="py-1 text-xs">Unbalanced P1</TableCell>
                {data.map((item: any) => (
                  <TableCell key={`unbalanced_p1-${item.provider}`} className="py-1 text-xs">
                    {item.unbalanced_p1_count}
                  </TableCell>
                ))}
                {data.map((item: any) => (
                  <TableCell key={`unbalanced_p1-${item.provider}`} className="py-1 text-xs">
                    {parseFloat(item.wow_pct_achv_unbalance_p1.toString()).toFixed(2)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow key={"unbalanced_p2"}>
                <TableCell className="py-1 text-xs">Unbalanced P2</TableCell>
                {data.map((item: any) => (
                  <TableCell key={`unbalanced_p2-${item.provider}`} className="py-1 text-xs">
                    {item.unbalanced_p2_count}
                  </TableCell>
                ))}
                {data.map((item: any) => (
                  <TableCell key={`unbalanced_p2-${item.provider}`} className="py-1 text-xs">
                    {parseFloat(item.wow_pct_achv_unbalance_p2.toString()).toFixed(2)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow key={"unbalanced_p3"}>
                <TableCell className="py-1 text-xs">Unbalanced P3</TableCell>
                {data.map((item: any) => (
                  <TableCell key={`unbalanced_p3-${item.provider}`} className="py-1 text-xs">
                    {item.unbalanced_p3_count}
                  </TableCell>
                ))}
                {data.map((item: any) => (
                  <TableCell key={`unbalanced_p3-${item.provider}`} className="py-1 text-xs">
                    {parseFloat(item.wow_pct_achv_unbalance_p3.toString()).toFixed(2)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>

          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Status Finansial Regional Unbalanced P1</TableHead>
                <TableHead className="text-xs">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow key={"balanced"}>
                <TableCell className="py-1 text-xs">{"Unbalance V2 - L18L21 vs L23 >40%"}</TableCell>
                {data.map((item: any) => (
                  <TableCell key={`balanced-${item.provider}`} className="py-1 text-xs">
                    {item.p1_unbalance_v2_l18l21_vs_l23}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow key={"unbalanced_p1"}>
                <TableCell className="py-1 text-xs">{"Unbalance V1 - L18L21 >30%"}</TableCell>
                {data.map((item: any) => (
                  <TableCell key={`unbalanced_p1-${item.provider}`} className="py-1 text-xs">
                    {item.p1_unbalance_v1_l18l21}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow key={"unbalanced_p2"}>
                <TableCell className="py-1 text-xs">{"Unbalance V3 - thp L9 >3Mbps to colo"}</TableCell>
                {data.map((item: any) => (
                  <TableCell key={`unbalanced_p2-${item.provider}`} className="py-1 text-xs">
                    {item.p1_unbalance_v3_thp_l9}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow key={"unbalanced_p3"}>
                <TableCell className="py-1 text-xs">{"Unbalance V2 - L18L21 >40%"}</TableCell>
                {data.map((item: any) => (
                  <TableCell key={`unbalanced_p3-${item.provider}`} className="py-1 text-xs">
                    {item.p1_unbalance_v2_l18l21_40}
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

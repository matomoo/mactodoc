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
import { Line } from "react-chartjs-2";
import { Badge } from "@/components/ui/badge";
import { useSummaryStore } from "@/stores/summaryStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

interface ChartDataItem {
  percent_rhi_all: number;
  year_week: number;
}

interface RhiChartContentProps {
  rhiApiPath: string;
  rhiLevel: string;
  rhiLocation: string;
}

export default function RhiChartContent({ rhiApiPath, rhiLevel }: RhiChartContentProps) {
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
      }));
    },
    enabled: !!(rhiApiPath && rhiApiPath !== "noUrl"),
  });

  // for chart rhi percentage
  const {
    data: rhiPercentageData,
    // isLoading: rhiPercentageLoading,
    // error: rhiPercentageError,
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

  // for rhi wow
  const {
    data: rhiWowData,
    // isLoading: rhiWowLoading,
    // error: rhiWowError,
  } = useQuery({
    queryKey: ["rhi-wow-data", yearweek, rhiApiPath, rhiLevel, valueLocation],
    queryFn: async () => {
      if (!rhiApiPath || rhiApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [
          `${rhiApiPath}-2?level=${viewBy}`,
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
      }));
    },
    enabled: !!(rhiApiPath && rhiApiPath !== "noUrl"),
  });

  const data = rawData || [];

  // console.log("Debug", { data, rhiPercentageData, rhiWowData });

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

  // Prepare data for line chart
  const lineChartData = {
    labels: rhiPercentageData?.map((item: any) => item.yearweek) || [],
    datasets: [
      {
        label: "RHI Percentage",
        data: rhiPercentageData?.map((item: any) => parseFloat(item.percent_rhi_all)) || [],
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

  return (
    <div className="flex flex-row gap-6">
      {Object.entries(groupedData).map(([metric]) => {
        return (
          <div key={metric} className="shrink-0 space-y-2" style={{ minWidth: "300px" }}>
            <div className="flex flex-row items-center">
              {/* Percentage of selected yearweek */}
              <div>
                {data && (
                  <h3
                    className="text-6xl"
                    style={{
                      fontSize: "3.2rem",
                      lineHeight: "1.1",
                      fontWeight: "bold",
                    }}
                  >
                    {parseFloat(data[0].percent_rhi_all).toFixed(2)}
                  </h3>
                )}
                {rhiWowData && (
                  <Badge
                    className={
                      (rhiWowData[0].wow_diff ?? 0) > 0
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }
                  >
                    {" "}
                    WOW {parseFloat(rhiWowData[0].wow_diff).toFixed(2)}%
                  </Badge>
                )}
              </div>
              {/* Chart of percent_rhi_all, get data from rhiPercentageData */}
              <div style={{ width: "250px", height: "200px" }}>
                {rhiPercentageData && rhiPercentageData.length > 0 ? (
                  <Line data={lineChartData} options={lineChartOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500">No RHI percentage data available</p>
                  </div>
                )}
              </div>
            </div>
            {rhiWowData && (
              <div>
                {/* generate table shadcn with data from rhiWowData, column region, mostly_kpi_fail_2g,mostly_kpi_fail_4g,mostly_kpi_fail_5g */}
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      {/* <TableHead className="text-xs">Region</TableHead> */}
                      <TableHead className="text-xs">Mostly KPI Fail 2G</TableHead>
                      <TableHead className="text-xs">Mostly KPI Fail 4G</TableHead>
                      <TableHead className="text-xs">Mostly KPI Fail 5G</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rhiWowData.map((item: any) => (
                      <TableRow key={item.region}>
                        {/* <TableCell className="text-xs py-1">
                          {item.region}
                        </TableCell> */}
                        <TableCell className="py-1 text-xs">{item.mostly_kpi_fail_2g}</TableCell>
                        <TableCell className="py-1 text-xs">{item.mostly_kpi_fail_4g}</TableCell>
                        <TableCell className="py-1 text-xs">{item.mostly_kpi_fail_5g}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

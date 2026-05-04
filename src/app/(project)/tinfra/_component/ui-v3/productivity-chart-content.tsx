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
import { Badge } from "@/components/ui/badge";
import { useSummaryStore } from "@/stores/summaryStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, ChartLegend, ChartDataLabels);

const getMetricDisplayName = (metric: string): string => {
  const metricMap: { [key: string]: string } = {
    yoy_payload_growth_pct: "Payload",
    yoy_traffic_growth_pct: "Traffic",
  };
  return metricMap[metric] || metric;
};

// Define KPI columns to chart
const getKpiColumns = (): string[] => {
  return ["yoy_payload_growth_pct", "yoy_traffic_growth_pct"];
};

interface ChartDataItem {
  provider: string;
  value: number;
  wow_diff: number | null;
  ytd_pct: number | null;
  mtd_pct: number | null;
  mtd_this_year_pct: number | null;
  wow_pct: number | null;
  rank: number | null;
  tech: string | null;
}

interface TechGroupedData {
  [tech: string]: ChartDataItem[];
}

interface ApiDataItem {
  selected_date: string;
  branch: string;
  mtd_traffic_this_year: number;
  mtd_traffic_last_year: number;
  mtd_traffic_diff: string;
  mtd_payload_this_year: number;
  mtd_payload_last_year: number;
  mtd_payload_diff: string;
  wow_traffic_current: number;
  wow_traffic_prior: number;
  wow_traffic_diff: string;
  wow_payload_current: number;
  wow_payload_prior: number;
  wow_payload_diff: string;

  region?: string;
  yoy_payload_growth_pct?: number;
  yoy_traffic_growth_pct?: number;
  wow_payload_growth_pct?: number;
  wow_traffic_growth_pct?: number;
  mtd_payload_growth_pct?: number;
  mtd_traffic_growth_pct?: number;
}

interface IProps {
  productivityApiPath: string;
  productivityLevel: string;
  productivityLocation: string;
}

export default function ProductivityChartContent({ productivityApiPath, productivityLevel }: IProps) {
  const { yearweek, viewBy, nop, region, kabupaten, kecamatan, dateEnd } = useSummaryStore();

  const valueLocation =
    viewBy === "region" ? region : viewBy === "nop" ? nop : viewBy === "kabupaten" ? kabupaten : kecamatan;

  const {
    data: productivityData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["productivity-data", yearweek, productivityApiPath, productivityLevel, valueLocation, dateEnd],
    queryFn: async () => {
      if (!productivityApiPath || productivityApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [
          `${productivityApiPath}?level=${viewBy}`,
          `valueLocation=${valueLocation}`,
          `yearweek=${yearweek}`,
          `tgl_1=${dateEnd}`,
          `tgl_2=${dateEnd}`,
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

  const { data: productivityNopData } = useQuery({
    queryKey: ["productivity2-data", yearweek, productivityApiPath, productivityLevel, valueLocation, dateEnd],
    queryFn: async () => {
      if (!productivityApiPath || productivityApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [
          `${productivityApiPath}-nop?level=${viewBy}`,
          `valueLocation=${valueLocation}`,
          `yearweek=${yearweek}`,
          `tgl_1=${dateEnd}`,
          `tgl_2=${dateEnd}`,
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

  const data = productivityData || [];
  const dataNop = productivityNopData || [];

  // console.log("debug:", { data, dataNop });

  // Sort dataNop by Yoy payload growth (smallest to largest)
  const sortedByPayloadYoY = [...(Array.isArray(dataNop) ? dataNop : [])].sort(
    (a, b) =>
      parseFloat(a.yoy_payload_growth_pct?.toString() || "0") - parseFloat(b.yoy_payload_growth_pct?.toString() || "0"),
  );

  // Sort dataNop by Yoy traffic growth (smallest to largest)
  const sortedByTrafficYoy = [...(Array.isArray(dataNop) ? dataNop : [])].sort(
    (a, b) =>
      parseFloat(a.yoy_traffic_growth_pct?.toString() || "0") - parseFloat(b.yoy_traffic_growth_pct?.toString() || "0"),
  );

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
          const wowColumn = kpiColumn.replace("yoy_", "wow_");

          // Map YTD columns to their corresponding MTD columns
          const mtdColumn = kpiColumn.replace("yoy_", "mtd_");
          const mtdThisYearColumn = kpiColumn.replace("yoy_", "mtd_this_year_");

          acc[kpiColumn][tech].push({
            provider: item.region || "Unknown", // Use region as provider name
            value: parseFloat(String(value)),
            wow_diff: item[wowColumn as keyof ApiDataItem]
              ? parseFloat(String(item[wowColumn as keyof ApiDataItem]))
              : null,
            ytd_pct: parseFloat(String(value)), // YTD is the main value
            mtd_pct: item[mtdColumn as keyof ApiDataItem]
              ? parseFloat(String(item[mtdColumn as keyof ApiDataItem]))
              : null,
            mtd_this_year_pct: item[mtdThisYearColumn as keyof ApiDataItem]
              ? parseFloat(String(item[mtdThisYearColumn as keyof ApiDataItem]))
              : null,
            wow_pct: item[wowColumn as keyof ApiDataItem]
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

  return (
    <div className="h-full space-y-6 overflow-x-auto">
      {/* Original charts */}
      <div className="flex flex-row gap-4 space-y-4">
        {Object.entries(groupedData).map(([metric, techData]) => (
          <div key={metric} className="space-y-2">
            {techData && (
              <h4
                className="font-bold text-lg"
                style={{
                  fontSize: "1.125rem",
                  lineHeight: "1.1",
                }}
              >
                {getMetricDisplayName(metric)}
              </h4>
            )}
            {techData && (
              <div className="flex flex-col space-y-1">
                <Badge
                  className={
                    (techData.ALL[0].ytd_pct ?? 0) > 0
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }
                >
                  YTD {parseFloat((techData.ALL[0].ytd_pct ?? 0).toString()).toFixed(2)} %
                </Badge>
                <Badge
                  className={
                    (techData.ALL[0].mtd_pct ?? 0) > 0
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }
                >
                  MTD last year {parseFloat((techData.ALL[0].mtd_pct ?? 0).toString()).toFixed(2)} %
                </Badge>
                <Badge
                  className={
                    (techData.ALL[0].mtd_this_year_pct ?? 0) > 0
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }
                >
                  MTD this year {parseFloat((techData.ALL[0].mtd_this_year_pct ?? 0).toString()).toFixed(2)} %
                </Badge>
                <Badge
                  className={
                    (techData.ALL[0].wow_pct ?? 0) > 0
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }
                >
                  WOW {parseFloat((techData.ALL[0].wow_pct ?? 0).toString()).toFixed(2)} %
                </Badge>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Payload Table */}
      <div className="space-y-2">
        <h4 className="font-bold text-md">Payload</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NOP</TableHead>
              <TableHead className="font-medium text-xs">Ytd Growth %</TableHead>
              <TableHead className="font-medium text-xs">MTD Growth %</TableHead>
              <TableHead className="font-medium text-xs">WoW Growth %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedByPayloadYoY.map((item, _index) => (
              <TableRow key={`payload-${item.branch}`}>
                <TableCell className="font-medium text-xs">{item.branch}</TableCell>
                <TableCell
                  className={
                    parseFloat(item.yoy_payload_growth_pct?.toString() || "0") >= 0
                      ? "text-green-600 text-xs"
                      : "text-red-600 text-xs"
                  }
                >
                  {item.yoy_payload_growth_pct}%
                </TableCell>
                <TableCell
                  className={
                    parseFloat(item.mtd_payload_growth_pct?.toString() || "0") >= 0
                      ? "text-green-600 text-xs"
                      : "text-red-600 text-xs"
                  }
                >
                  {item.mtd_payload_growth_pct}%
                </TableCell>
                <TableCell
                  className={
                    parseFloat(item.wow_payload_growth_pct?.toString() || "0") >= 0
                      ? "text-green-600 text-xs"
                      : "text-red-600 text-xs"
                  }
                >
                  {item.wow_payload_growth_pct}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Traffic Table */}
      <div className="space-y-2">
        <h3 className="font-bold text-md">Traffic</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium text-xs">Branch</TableHead>
              <TableHead className="font-medium text-xs">Ytd Growth %</TableHead>

              <TableHead className="font-medium text-xs">MTD Growth %</TableHead>
              <TableHead className="font-medium text-xs">WoW Growth %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedByTrafficYoy.map((item, _index) => (
              <TableRow key={`traffic-${item.branch}`}>
                <TableCell className="font-medium text-xs">{item.branch}</TableCell>
                <TableCell
                  className={
                    parseFloat(item.yoy_traffic_growth_pct?.toString() || "0") >= 0
                      ? "text-green-600 text-xs"
                      : "text-red-600 text-xs"
                  }
                >
                  {item.yoy_traffic_growth_pct}%
                </TableCell>

                <TableCell
                  className={
                    parseFloat(item.mtd_traffic_growth_pct?.toString() || "0") >= 0
                      ? "text-green-600 text-xs"
                      : "text-red-600 text-xs"
                  }
                >
                  {item.mtd_traffic_growth_pct}%
                </TableCell>
                <TableCell
                  className={
                    parseFloat(item.wow_traffic_growth_pct?.toString() || "0") >= 0
                      ? "text-green-600 text-xs"
                      : "text-red-600 text-xs"
                  }
                >
                  {item.wow_traffic_growth_pct}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

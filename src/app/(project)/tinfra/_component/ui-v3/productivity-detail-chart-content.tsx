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
import { useSummaryStore } from "@/stores/summaryStore";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, ChartLegend, ChartDataLabels);

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

export default function ProductivityDetailChartContent({ productivityApiPath, productivityLevel }: IProps) {
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

  console.log("debug:", { dataForChart });

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

  return <div className="h-full space-y-6 overflow-x-auto">wait</div>;
}

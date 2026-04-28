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

export default function ProductivityDetailContent({ productivityApiPath, productivityLevel }: IProps) {
  const { yearweek, viewBy, nop, region, kabupaten, kecamatan, dateRange2 } = useSummaryStore();

  const valueLocation =
    viewBy === "region" ? region : viewBy === "nop" ? nop : viewBy === "kabupaten" ? kabupaten : kecamatan;

  // Fetch productivity data by NOP
  const {
    data: productivityNopData,
    isLoading: productivityNopLoading,
    error: productivityNopError,
  } = useQuery({
    queryKey: ["productivity2-data", yearweek, productivityApiPath, productivityLevel, valueLocation, dateRange2],
    queryFn: async () => {
      if (!productivityApiPath || productivityApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [
          `${productivityApiPath}-nop?level=${viewBy}`,
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

  // Fetch productivity data by NOP - kabupaten
  const {
    data: productivityNopKabupatenData,
    isLoading: productivityNopKabupatenLoading,
    error: productivityNopKabupatenError,
  } = useQuery({
    queryKey: ["productivity2-data", yearweek, productivityApiPath, productivityLevel, valueLocation, dateRange2],
    queryFn: async () => {
      if (!productivityApiPath || productivityApiPath === "noUrl") {
        return [];
      }

      const response = await fetch(
        [
          `${productivityApiPath}-nop-kabupaten?level=${viewBy}`,
          `valueLocation=${valueLocation}`,
          `yearweek=${yearweek}`,
          `nop=${nop}`,
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

  const dataNop = productivityNopData || [];
  const dataNopKabupaten = productivityNopKabupatenData || [];

  // console.log("debug:", { data, dataNop });

  // Sort dataNop by Yoy payload growth (smallest to largest)
  const sortedByPayloadYoYNop = [...(Array.isArray(dataNop) ? dataNop : [])].sort(
    (a, b) =>
      parseFloat(a.yoy_payload_growth_pct?.toString() || "0") - parseFloat(b.yoy_payload_growth_pct?.toString() || "0"),
  );

  if (productivityNopLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const sortedByPayloadYoYNopKabupaten = [...(Array.isArray(dataNopKabupaten) ? dataNopKabupaten : [])].sort(
    (a, b) =>
      parseFloat(a.yoy_payload_growth_pct?.toString() || "0") - parseFloat(b.yoy_payload_growth_pct?.toString() || "0"),
  );

  if (productivityNopError) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-red-500">Error: {productivityNopError.message}</p>
      </div>
    );
  }

  if (dataNop.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="h-[150px] space-y-6 overflow-x-auto">
      {/* Payload List */}
      <div className="space-y-3">
        <h4 className="font-bold text-md">Payload</h4>
        <div className="space-y-2">
          {/* NOP Collapsible Section */}

          <div className="mt-2 space-y-2">
            {sortedByPayloadYoYNop.map((item, _index) => (
              <div
                key={`payload-${item.branch}`}
                className="ml-4 rounded-lg border bg-card p-3 text-card-foreground shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{item.branch}</div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">YTD</div>
                      <div
                        className={
                          parseFloat(item.yoy_payload_growth_pct?.toString() || "0") >= 0
                            ? "text-green-600 text-xs font-medium"
                            : "text-red-600 text-xs font-medium"
                        }
                      >
                        {item.yoy_payload_growth_pct}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">MTD</div>
                      <div
                        className={
                          parseFloat(item.mtd_payload_growth_pct?.toString() || "0") >= 0
                            ? "text-green-600 text-xs font-medium"
                            : "text-red-600 text-xs font-medium"
                        }
                      >
                        {item.mtd_payload_growth_pct}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">WoW</div>
                      <div
                        className={
                          parseFloat(item.wow_payload_growth_pct?.toString() || "0") >= 0
                            ? "text-green-600 text-xs font-medium"
                            : "text-red-600 text-xs font-medium"
                        }
                      >
                        {item.wow_payload_growth_pct}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

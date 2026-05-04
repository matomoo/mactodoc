/** biome-ignore-all lint/suspicious/noExplicitAny: <none> */
"use client";

// biome-ignore assist/source/organizeImports: <none>
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, ChartLegend, ChartDataLabels);

interface ApiDataItem {
  selected_date: string;
  branch: string;
  kotakab: string;
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
  productivityColumn?: string;
  title?: string;
}

export default function ProductivityDetailContent({
  productivityApiPath,
  productivityLevel,
  productivityColumn,
  title,
}: IProps) {
  const { yearweek, viewBy, nop, region, kabupaten, kecamatan, dateEnd } = useSummaryStore();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [openBranch, setOpenBranch] = useState<string | null>(null);

  const valueLocation =
    viewBy === "region" ? region : viewBy === "nop" ? nop : viewBy === "kabupaten" ? kabupaten : kecamatan;

  // Fetch productivity data by NOP
  const {
    data: productivityNopData,
    isLoading: productivityNopLoading,
    error: productivityNopError,
  } = useQuery({
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

  // Fetch productivity data by NOP - kabupaten (conditional on selected branch)
  const {
    data: productivityNopKabupatenData,
    isLoading: productivityNopKabupatenLoading,
    error: productivityNopKabupatenError,
  } = useQuery({
    queryKey: [
      "productivity2-data-kabupaten",
      yearweek,
      productivityApiPath,
      productivityLevel,
      valueLocation,
      dateEnd,
      selectedBranch,
    ],
    queryFn: async () => {
      if (!productivityApiPath || productivityApiPath === "noUrl" || !selectedBranch) {
        return [];
      }

      const response = await fetch(
        [
          `${productivityApiPath}-nop-kabupaten?level=${viewBy}`,
          `valueLocation=${valueLocation}`,
          `yearweek=${yearweek}`,
          `nop=${selectedBranch}`,
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
    enabled: !!(productivityApiPath && productivityApiPath !== "noUrl" && selectedBranch),
  });

  const dataNop = productivityNopData || [];
  const dataNopKabupaten = productivityNopKabupatenData || [];

  // console.log("debug:", { data, dataNop });

  // Sort dataNop by Yoy payload growth (smallest to largest)
  const sortedByPayloadYoYNop = [...(Array.isArray(dataNop) ? dataNop : [])].sort(
    (a, b) =>
      parseFloat(a[`yoy_${productivityColumn}_pct` as keyof ApiDataItem]?.toString() || "0") -
      parseFloat(b[`yoy_${productivityColumn}_pct` as keyof ApiDataItem]?.toString() || "0"),
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
      parseFloat(a[`yoy_${productivityColumn}_pct` as keyof ApiDataItem]?.toString() || "0") -
      parseFloat(b[`yoy_${productivityColumn}_pct` as keyof ApiDataItem]?.toString() || "0"),
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
    <div className="h-screen space-y-6 overflow-x-auto">
      {/* Payload List */}
      <div className="space-y-3">
        <div className="space-y-2">
          {sortedByPayloadYoYNop.map((item, _index) => (
            <Collapsible
              key={`payload-${item.branch}`}
              className="rounded-lg border bg-card"
              open={openBranch === item.branch}
              onOpenChange={(open) => {
                if (open) {
                  setOpenBranch(item.branch);
                  setSelectedBranch(item.branch);
                } else {
                  setOpenBranch(null);
                }
              }}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-3 text-left hover:bg-accent/50">
                <div className="flex items-center justify-between flex-1">
                  <div className="font-medium text-sm">{item.branch}</div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">YTD</div>
                      <div
                        className={
                          parseFloat(item[`yoy_${productivityColumn}_pct` as keyof ApiDataItem]?.toString() || "0") >= 0
                            ? "text-green-600 text-xs font-medium"
                            : "text-red-600 text-xs font-medium"
                        }
                      >
                        {item[`yoy_${productivityColumn}_pct` as keyof ApiDataItem]}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">MTD</div>
                      <div
                        className={
                          parseFloat(item[`mtd_${productivityColumn}_pct` as keyof ApiDataItem]?.toString() || "0") >= 0
                            ? "text-green-600 text-xs font-medium"
                            : "text-red-600 text-xs font-medium"
                        }
                      >
                        {item[`mtd_${productivityColumn}_pct` as keyof ApiDataItem]}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">WoW</div>
                      <div
                        className={
                          parseFloat(item[`wow_${productivityColumn}_pct` as keyof ApiDataItem]?.toString() || "0") >= 0
                            ? "text-green-600 text-xs font-medium"
                            : "text-red-600 text-xs font-medium"
                        }
                      >
                        {item[`wow_${productivityColumn}_pct` as keyof ApiDataItem]}%
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t bg-muted/50 p-3">
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Kabupaten Details</h5>
                  {selectedBranch === item.branch && productivityNopKabupatenLoading && (
                    <p className="text-sm text-muted-foreground">Loading kabupaten data...</p>
                  )}
                  {selectedBranch === item.branch && !productivityNopKabupatenLoading && (
                    <>
                      {sortedByPayloadYoYNopKabupaten.map((kabItem, kabIndex) => (
                        <div
                          key={`kab-${kabItem.branch}-${kabIndex}`}
                          className="ml-4 rounded border bg-background p-2 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{kabItem.kotakab || "Unknown Region"}</div>
                            <div className="flex gap-3">
                              <div className="text-right">
                                <div className="text-xs text-muted-foreground">YTD</div>
                                <div
                                  className={
                                    parseFloat(kabItem.yoy_payload_growth_pct?.toString() || "0") >= 0
                                      ? "text-green-600 text-xs font-medium"
                                      : "text-red-600 text-xs font-medium"
                                  }
                                >
                                  {kabItem.yoy_payload_growth_pct}%
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-muted-foreground">MTD</div>
                                <div
                                  className={
                                    parseFloat(kabItem.mtd_payload_growth_pct?.toString() || "0") >= 0
                                      ? "text-green-600 text-xs font-medium"
                                      : "text-red-600 text-xs font-medium"
                                  }
                                >
                                  {kabItem.mtd_payload_growth_pct}%
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-muted-foreground">WoW</div>
                                <div
                                  className={
                                    parseFloat(kabItem.wow_payload_growth_pct?.toString() || "0") >= 0
                                      ? "text-green-600 text-xs font-medium"
                                      : "text-red-600 text-xs font-medium"
                                  }
                                >
                                  {kabItem.wow_payload_growth_pct}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {sortedByPayloadYoYNopKabupaten.length === 0 && (
                        <p className="text-sm text-muted-foreground">No kabupaten data available</p>
                      )}
                    </>
                  )}
                  {selectedBranch !== item.branch && (
                    <p className="text-sm text-muted-foreground">Click to load kabupaten data</p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
}

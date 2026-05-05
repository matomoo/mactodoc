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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, ChartLegend, ChartDataLabels);

interface ApiDataItem {
  rank_group: string;
  rank: string;
  selected_date: string;
  kotakab: string;
  ytd_payload_this_year: number;
  ytd_payload_last_year: number;
  yoy_payload_diff: string;
  yoy_payload_growth_pct: string;
  mtd_payload_growth_pct: string;
  mtd_this_year_payload_growth_pct: string;
  wow_payload_growth_pct: string;
}

interface IProps {
  productivityApiPath: string;
  productivityLevel: string;
  productivityLocation: string;
  productivityColumn?: string;
  title?: string;
}

export default function ProductivityDetailTopnContent({
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

  const dataNop = productivityNopData || [];

  console.log("debug:", { dataNop });

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

  // Separate data into growth plus and growth minus
  const growthPlusData = sortedByPayloadYoYNop.filter((item) => parseFloat(item.yoy_payload_growth_pct) >= 0);
  const growthMinusData = sortedByPayloadYoYNop.filter((item) => parseFloat(item.yoy_payload_growth_pct) < 0);

  return (
    <div className="space-y-8">
      {/* Growth Plus Table */}
      {growthPlusData.length > 0 && (
        <div className="space-y-4">
          <div className="font-semibold text-green-600 text-lg">YoY Growth Plus ({growthPlusData.length})</div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Kotakab</TableHead>
                  <TableHead className="text-right">YoY Growth %</TableHead>
                  <TableHead className="text-right">MTD Growth %</TableHead>
                  <TableHead className="text-right">MTD This Year Growth %</TableHead>
                  <TableHead className="text-right">WoW Growth %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {growthPlusData.map((item) => (
                  <TableRow key={`${item.rank}-${item.kotakab}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.rank_group === "TOP_PLUS" ? "default" : "secondary"}>{item.rank}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.kotakab}</TableCell>

                    <TableCell className="text-right">
                      <span
                        className={parseFloat(item.yoy_payload_growth_pct) >= 0 ? "text-green-600" : "text-red-600"}
                      >
                        {parseFloat(item.yoy_payload_growth_pct).toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={parseFloat(item.mtd_payload_growth_pct) >= 0 ? "text-green-600" : "text-red-600"}
                      >
                        {parseFloat(item.mtd_payload_growth_pct).toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          parseFloat(item.mtd_this_year_payload_growth_pct) >= 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {parseFloat(item.mtd_this_year_payload_growth_pct).toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={parseFloat(item.wow_payload_growth_pct) >= 0 ? "text-green-600" : "text-red-600"}
                      >
                        {parseFloat(item.wow_payload_growth_pct).toFixed(2)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Growth Minus Table */}
      {growthMinusData.length > 0 && (
        <div className="space-y-4">
          <div className="text-lg font-semibold text-red-600">YoY Growth Minus ({growthMinusData.length})</div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Kotakab</TableHead>
                  <TableHead className="text-right">YoY Growth %</TableHead>
                  <TableHead className="text-right">MTD Growth %</TableHead>
                  <TableHead className="text-right">MTD This Year Growth %</TableHead>
                  <TableHead className="text-right">WoW Growth %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {growthMinusData.map((item) => (
                  <TableRow key={`${item.rank}-${item.kotakab}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.rank_group === "TOP_PLUS" ? "default" : "secondary"}>{item.rank}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.kotakab}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={parseFloat(item.yoy_payload_growth_pct) >= 0 ? "text-green-600" : "text-red-600"}
                      >
                        {parseFloat(item.yoy_payload_growth_pct).toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={parseFloat(item.mtd_payload_growth_pct) >= 0 ? "text-green-600" : "text-red-600"}
                      >
                        {parseFloat(item.mtd_payload_growth_pct).toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          parseFloat(item.mtd_this_year_payload_growth_pct) >= 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {parseFloat(item.mtd_this_year_payload_growth_pct).toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={parseFloat(item.wow_payload_growth_pct) >= 0 ? "text-green-600" : "text-red-600"}
                      >
                        {parseFloat(item.wow_payload_growth_pct).toFixed(2)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

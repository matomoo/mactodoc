"use client";

import { useRef, useState } from "react";

import { pdf } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import { saveAs } from "file-saver";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type {
  DataKpiStatistic4g,
  DataPayloadBandSiteSow,
  DataPayloadThpUser,
  SqacTrackerItem,
} from "@/app/(project)/mdoc/def/interfaces";
import { formatDayName } from "@/app/(project)/mdoc/utils/parserDate";
import { NoDataState } from "@/app/(project)/tinfra/_component/ui-v4/additional-component";
import { Button } from "@/components/ui/button";

import type { ChartPayloadBandCellSowRef } from "./ChartPayloadBandCellSow";
import ChartPayloadBandCellSow from "./ChartPayloadBandCellSow";
import type { ChartPayloadBandSiteSowRef } from "./ChartPayloadBandSiteSow";
import ChartPayloadBandSiteSow from "./ChartPayloadBandSiteSow";
import type { ChartPayloadThpUserRef } from "./ChartPayloadThpUser";
import ChartPayloadThpUser from "./ChartPayloadThpUser";
import type { ChartRrcUtilizationRef } from "./ChartRrcUtilization";
import ChartRrcUtilization from "./ChartRrcUtilization";
import SqacPdfDocument from "./SqacPdfDocument";

function _formatDate(dateStr: string | null) {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function _formatValue(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") return "---";
  return value;
}

function _formatYn(value: string | number | null | undefined): string {
  if (value === 1 || value === "1") return "Y";
  if (value === 0 || value === "0") return "N";
  return String(value ?? "");
}

export default function TabKpiStatisticPage({ wid }: { wid: string }) {
  const [beforeDay1, setBeforeDay1] = useState("2026-05-01");
  const [beforeDay2, setBeforeDay2] = useState("2026-05-02");
  const [beforeDay3, setBeforeDay3] = useState("2026-05-03");
  const [afterDay1, setAfterDay1] = useState("2026-06-01");
  const [afterDay2, setAfterDay2] = useState("2026-06-02");
  const [afterDay3, setAfterDay3] = useState("2026-06-03");
  const [isExporting, setIsExporting] = useState(false);

  // Refs for chart components
  const chartPayloadThpUserRefs = useRef<Map<string, ChartPayloadThpUserRef>>(new Map());
  const chartPayloadBandSiteSowRef = useRef<ChartPayloadBandSiteSowRef>(null);
  const chartPayloadBandSiteTierRef = useRef<ChartPayloadBandSiteSowRef>(null);
  const chartRrcUtilizationRef = useRef<ChartPayloadBandSiteSowRef>(null);
  const chartPayload2gCellSiteSowRef = useRef<ChartPayloadBandSiteSowRef>(null);
  const chartPayload2gSiteTierRef = useRef<ChartPayloadBandSiteSowRef>(null);
  const chartTrafficMiniClusterRef = useRef<ChartPayloadBandSiteSowRef>(null);
  const chartPayloadMiniClusterRef = useRef<ChartPayloadBandSiteSowRef>(null);
  const chartPayload4gCellSowRefs = useRef<Map<string, ChartPayloadBandCellSowRef>>(new Map());
  const chartUtilization4gCellSowRefs = useRef<Map<string, ChartPayloadBandCellSowRef>>(new Map());

  const {
    data: dataSqacTracker,
    isPending: isPendingSqacTracker,
    error: errorSqacTracker,
  } = useQuery<SqacTrackerItem[]>({
    queryKey: ["sqac-tracker", wid],
    queryFn: async () => {
      const response = await fetch(`/mdoc/api/v1/sqac-tracker?wid=${encodeURIComponent(wid)}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      return response.json();
    },
    enabled: !!wid,
  });

  const {
    data: dataTargetKpiStatistic4g,
    isPending: isPendingTargetKpiStatistic4g,
    error: errorTargetKpiStatistic4g,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["target-kpi-statistic-4g", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/target-kpi-statistic-4g?siteid=${dataSqacTracker?.[0].siteid}&band=${dataSqacTracker?.[0].band_4g_sow}&city=${dataSqacTracker?.[0].kabupaten}&day1=2026-06-01&day2=2026-06-02&day3=2026-06-03`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  // console.log("dataTargetKpiStatistic4g", dataTargetKpiStatistic4g);

  const {
    data: dataKpiStatistic4g,
    isPending: isPendingKpiStatistic4g,
    error: errorKpiStatistic4g,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["kpi-statistic-4g", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/kpi-statistic-4g?siteid=${dataSqacTracker?.[0].siteid}&band=${dataSqacTracker?.[0].band_4g_sow}&city=${dataSqacTracker?.[0].kabupaten}&day1=2026-06-01&day2=2026-06-02&day3=2026-06-03`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataTargetKpiStatistic2g,
    isPending: isPendingTargetKpiStatistic2g,
    error: errorTargetKpiStatistic2g,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["target-kpi-statistic-2g", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/target-kpi-statistic-2g?siteid=${dataSqacTracker?.[0].siteid}&band=${dataSqacTracker?.[0].band_4g_sow === "L900" ? "GSM900" : "DCS1800"}&city=${dataSqacTracker?.[0].kabupaten}&day1=2026-06-01&day2=2026-06-02&day3=2026-06-03`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  // console.log({ dataTargetKpiStatistic2g });

  const {
    data: dataKpiStatistic2g,
    isPending: isPendingKpiStatistic2g,
    error: errorKpiStatistic2g,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["kpi-statistic-2g", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/kpi-statistic-2g?siteid=${dataSqacTracker?.[0].siteid}&band=${dataSqacTracker?.[0].band_4g_sow === "L900" ? "GSM900" : "DCS1800"}&city=${dataSqacTracker?.[0].kabupaten}&day1=2026-06-01&day2=2026-06-02&day3=2026-06-03`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataProductivityPayload,
    isPending: isPendingProductivityPayload,
    error: errorProductivityPayload,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["productivity-payload", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/productivity-payload?siteid=${dataSqacTracker?.[0].siteid}&band=${dataSqacTracker?.[0].band_4g_sow === "L900" ? "GSM900" : "DCS1800"}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&beforeDay2=${beforeDay2}&beforeDay3=${beforeDay3}&afterDay1=${afterDay1}&afterDay2=${afterDay2}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataProductivityTraffic,
    isPending: isPendingProductivityTraffic,
    error: errorProductivityTraffic,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["productivity-traffic", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/productivity-traffic?siteid=${dataSqacTracker?.[0].siteid}&band=${dataSqacTracker?.[0].band_4g_sow === "L900" ? "GSM900" : "DCS1800"}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&beforeDay2=${beforeDay2}&beforeDay3=${beforeDay3}&afterDay1=${afterDay1}&afterDay2=${afterDay2}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataPayloadThpUser,
    isPending: isPendingPayloadThpUser,
    error: errorPayloadThpUser,
  } = useQuery<DataPayloadThpUser[]>({
    queryKey: ["payload-thp-user", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/payload-thp-user?siteid=${dataSqacTracker?.[0].siteid}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataPayloadBandSiteSow,
    isPending: isPendingPayloadBandSiteSow,
    error: errorPayloadBandSiteSow,
  } = useQuery<DataPayloadBandSiteSow[]>({
    queryKey: ["payload-band-site-sow", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/payload-band-site-sow?siteid=${dataSqacTracker?.[0].siteid}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataPayloadBandSiteTier,
    isPending: isPendingPayloadBandSiteTier,
    error: errorPayloadBandSiteTier,
  } = useQuery<DataPayloadBandSiteSow[]>({
    queryKey: ["payload-band-site-tier", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/payload-band-site-tier?siteid=${dataSqacTracker?.[0].siteid}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataRrcUtilization,
    isPending: isPendingRrcUtilization,
    error: errorRrcUtilization,
  } = useQuery<DataPayloadBandSiteSow[]>({
    queryKey: ["rrc-utilization", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/rrc-utilization?siteid=${dataSqacTracker?.[0].siteid}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataPayload2gCellSiteSow,
    isPending: isPendingPayload2gCellSiteSow,
    error: errorPayload2gCellSiteSow,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["payload-2g-cell-site-sow", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/payload-2g-cell-site-sow?siteid=${dataSqacTracker?.[0].siteid}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataPayload2gSiteTier,
    isPending: isPendingPayload2gSiteTier,
    error: errorPayload2gSiteTier,
  } = useQuery<DataPayloadBandSiteSow[]>({
    queryKey: ["payload-2g-site-tier", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/payload-2g-site-tier?siteid=${dataSqacTracker?.[0].siteid}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataTrafficMiniCluster,
    isPending: isPendingTrafficMiniCluster,
    error: errorTrafficMiniCluster,
  } = useQuery<DataPayloadBandSiteSow[]>({
    queryKey: ["traffic-mini-cluster", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/traffic-mini-cluster?siteid=${dataSqacTracker?.[0].siteid}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataPayloadMiniCluster,
    isPending: isPendingPayloadMiniCluster,
    error: errorPayloadMiniCluster,
  } = useQuery<DataPayloadBandSiteSow[]>({
    queryKey: ["payload-mini-cluster", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/payload-mini-cluster?siteid=${dataSqacTracker?.[0].siteid}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataTablePrbUtilization,
    isPending: isPendingTablePrbUtilization,
    error: errorTablePrbUtilization,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["table-prb-utilization", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/prb-utilization?siteid=${dataSqacTracker?.[0].siteid}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataPayload4gCellSow,
    isPending: isPendingPayload4gCellSow,
    error: errorPayload4gCellSow,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["payload-4g-cell-sow", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/payload-4g-cell-sow?siteid=${dataSqacTracker?.[0].siteid}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataUtilization4gCellSow,
    isPending: isPendingUtilization4gCellSow,
    error: errorUtilization4gCellSow,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["utilization-4g-cell-sow", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/utilization-4g-cell-sow?siteid=${dataSqacTracker?.[0].siteid}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataGetActivityLog,
    isPending: isPendingGetActivityLog,
    error: errorGetActivityLog,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["get-activity-log", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/get-activity-log?siteid=${dataSqacTracker?.[0].siteid}&band=${dataSqacTracker?.[0].band_4g_sow}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  console.log({ dataGetActivityLog });

  const handleExportPdf = async () => {
    if (!dataSqacTracker || dataSqacTracker.length === 0) return;
    const blob = await pdf(<SqacPdfDocument data={dataSqacTracker} wid={wid} />).toBlob();
    saveAs(blob, `SQAC-${wid}.pdf`);
  };

  const handleExportChartsToServer = async () => {
    setIsExporting(true);

    try {
      // Export Payload Band Site SOW chart
      if (chartPayloadBandSiteSowRef.current) {
        const imageData = chartPayloadBandSiteSowRef.current.getImageData();
        if (imageData) {
          const filename = `${wid}-chart-payload-band-site-sow.jpg`;
          const response = await fetch("/mdoc/api/v1/chart-export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData, filename }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to save chart");
          }
        }
      }

      // Export Payload Band Site Tier chart
      if (chartPayloadBandSiteTierRef.current) {
        const imageData = chartPayloadBandSiteTierRef.current.getImageData();
        if (imageData) {
          const filename = `${wid}-chart-payload-band-site-tier.jpg`;
          const response = await fetch("/mdoc/api/v1/chart-export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData, filename }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to save chart");
          }
        }
      }

      // Export RRC Utilization chart
      if (chartRrcUtilizationRef.current) {
        const imageData = chartRrcUtilizationRef.current.getImageData();
        if (imageData) {
          const filename = `${wid}-chart-rrc-utilization.jpg`;
          const response = await fetch("/mdoc/api/v1/chart-export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData, filename }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to save chart");
          }
        }
      }

      // Export Payload 2G Cell Site SOW chart
      if (chartPayload2gCellSiteSowRef.current) {
        const imageData = chartPayload2gCellSiteSowRef.current.getImageData();
        if (imageData) {
          const filename = `${wid}-chart-payload-2g-cell-site-sow.jpg`;
          const response = await fetch("/mdoc/api/v1/chart-export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData, filename }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to save chart");
          }
        }
      }

      // Export Payload 2G Site Tier chart
      if (chartPayload2gSiteTierRef.current) {
        const imageData = chartPayload2gSiteTierRef.current.getImageData();
        if (imageData) {
          const filename = `${wid}-chart-payload-2g-site-tier.jpg`;
          const response = await fetch("/mdoc/api/v1/chart-export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData, filename }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to save chart");
          }
        }
      }

      // Export Traffic Mini Cluster chart
      if (chartTrafficMiniClusterRef.current) {
        const imageData = chartTrafficMiniClusterRef.current.getImageData();
        if (imageData) {
          const filename = `${wid}-chart-traffic-mini-cluster.jpg`;
          const response = await fetch("/mdoc/api/v1/chart-export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData, filename }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to save chart");
          }
        }
      }

      // Export Payload Mini Cluster chart
      if (chartPayloadMiniClusterRef.current) {
        const imageData = chartPayloadMiniClusterRef.current.getImageData();
        if (imageData) {
          const filename = `${wid}-chart-payload-mini-cluster.jpg`;
          const response = await fetch("/mdoc/api/v1/chart-export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData, filename }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to save chart");
          }
        }
      }

      // Export Payload Cell Per Sector charts
      for (const [sector, chartRef] of chartPayload4gCellSowRefs.current.entries()) {
        const imageData = chartRef.getImageData();
        if (imageData) {
          const filename = `${wid}-chart-payload-cell-per-sector-payload-${sector.toLowerCase().replace(/\s+/g, "-")}.jpg`;
          const response = await fetch("/mdoc/api/v1/chart-export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData, filename }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to save chart");
          }
        }
      }

      for (const [sector, chartRef] of chartUtilization4gCellSowRefs.current.entries()) {
        const imageData = chartRef.getImageData();
        if (imageData) {
          const filename = `${wid}-chart-payload-cell-per-sector-util-${sector.toLowerCase().replace(/\s+/g, "-")}.jpg`;
          const response = await fetch("/mdoc/api/v1/chart-export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData, filename }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to save chart");
          }
        }
      }

      toast.success("Charts exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to export charts");
    } finally {
      setIsExporting(false);
    }
  };

  const uniqueSector = [...new Set(dataPayloadThpUser?.map((item) => item.sector) || [])];

  return (
    <div className="mx-auto w-full space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">KPI Statistic</h1>
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={handleExportChartsToServer}
            disabled={isExporting || uniqueSector.length === 0}
          >
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export Charts
          </Button>
          <Button
            variant="default"
            onClick={handleExportPdf}
            disabled={!dataSqacTracker || dataSqacTracker.length === 0}
          >
            Export to PDF
          </Button>
        </div>
      </div>

      {/* Table Information 4G */}
      {isPendingSqacTracker && <div className="text-muted-foreground">Loading...</div>}
      {errorSqacTracker && <div className="text-destructive">Error: {errorSqacTracker.message}</div>}

      {!dataSqacTracker || dataSqacTracker.length === 0 ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        dataSqacTracker.map((item) => (
          <div key={"table-1"}>
            <div className="font-bold text-lg">SITE QUALITY ACCEPTANCE CERTIFICATE</div>
            <div className="mt-2 text-sm">SITEID-PDID: {wid}</div>
            <div className="flex flex-col">
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-t border-r border-b border-l p-1 font-bold">Site ID</div>
                <div className="w-62.5 shrink-0 border-t border-r border-b p-1 text-center">{item.siteid}</div>
                <div className="w-37.5 shrink-0 border-t border-r border-b p-1 font-bold">Band SOW</div>
                <div className="w-62.5 shrink-0 border-t border-r border-b p-1 text-center">
                  {item.band_4g_sow}-{item.band_2g_sow}
                </div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">Site Name</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.site_name_4g}</div>
                <div className="w-37.5 shrink-0 border-r border-b p-1 font-bold">eNodeB ID</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.enodeb_id}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">Type Of Work</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.type_of_work}</div>
                <div className="w-37.5 shrink-0 border-r border-b p-1 font-bold">TAC</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.tac}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">City</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.kabupaten}</div>
                <div className="w-37.5 shrink-0 border-r border-b p-1 font-bold">Cell ID</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.cell_id_4g}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">Band Impact</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">
                  {item.band_4g_sow}-{item.band_2g_sow}
                </div>
                <div className="w-37.5 shrink-0 border-r border-b p-1 font-bold">{""}</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{""}</div>
              </div>
            </div>

            <div className="mt-2 flex flex-row">
              <div className="w-37.5 shrink-0 border-t border-r border-b border-l p-1 font-bold">Integration Date</div>
              <div className="w-32 shrink-0 border-t border-r border-b p-1 text-center">{item.connected}</div>
              <div className="w-37.5 shrink-0 border-t border-r border-b p-1 font-bold">{"On Air Date"}</div>
              <div className="w-32 shrink-0 border-t border-r border-b p-1 text-center">{item.connected}</div>
              <div className="w-37.5 shrink-0 border-t border-r border-b p-1 font-bold">{"Acceptance Date"}</div>
              <div className="w-32 shrink-0 border-t border-r border-b p-1 text-center">{""}</div>
            </div>
          </div>
        ))
      )}

      {/* Target KPI Statistic 4G */}
      {isPendingTargetKpiStatistic4g && <div className="text-muted-foreground">Loading...</div>}
      {errorTargetKpiStatistic4g && <div className="text-destructive">Error: {errorTargetKpiStatistic4g.message}</div>}

      {!dataTargetKpiStatistic4g || dataTargetKpiStatistic4g.length === 0 ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        <div key={"table-target-kpi-4g"} className="overflow-x-auto">
          <div className="flex flex-row flex-nowrap">
            <div className="w-20.5 shrink-0 border-t border-r border-b border-l p-1">City</div>
            <div className="w-20.5 shrink-0 border-t border-r border-b border-l p-1">Band</div>
            <div className="flex flex-col">
              <div className="flex flex-row">
                <div className="flex flex-col">
                  <div className="flex flex-row">
                    <div className="w-205 shrink-0 border-t border-r border-b p-1 text-center">
                      Cluster Value Summary
                    </div>
                  </div>
                  <div className="flex flex-row">
                    <div className="w-20.5 shrink-0 text-wrap border-t border-r border-b p-1 text-center">
                      RRC Est Success Rate (%)
                    </div>
                    <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
                      E-RAB Success Rate (%)
                    </div>
                    <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
                      Call Setup Success Rate (%)
                    </div>
                    <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
                      E-RAB Drop Rate (%)
                    </div>
                    <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
                      Intra Freq LTE HO (%)
                    </div>
                    <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
                      Inter Freq LTE HO (%)
                    </div>
                    <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">CSFB (%)</div>
                    <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">CQI Average</div>
                    <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">SE2</div>
                    <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Uplink RSSI (dBm)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="w-20.5 shrink-0 text-wrap border-t border-r border-b border-l p-1 text-center">LUWU</div>
            <div className="w-20.5 shrink-0 text-wrap border-t border-r border-b p-1 text-center">L900</div>
            <div className="w-20.5 shrink-0 text-wrap border-t border-r border-b border-l p-1 text-center">
              {dataTargetKpiStatistic4g[0]["RRC Est Success Rate (%)"] || ""}
            </div>
            <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["E-RAB Success Rate (%)"] || ""}
            </div>
            <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["Call Setup Success Rate (%)"] || ""}
            </div>
            <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["E-RAB Drop Rate (%)"] || ""}
            </div>
            <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["Intra Freq LTE HO (%)"] || ""}
            </div>
            <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["Inter Freq LTE HO (%)"] || "95.00"}
            </div>
            <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["CSFB (%)"] || ""}
            </div>
            <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["CQI Average"] || ""}
            </div>
            <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0].SE2 || ""}
            </div>
            <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["Uplink RSSI (dBm)"] || ""}
            </div>
          </div>
        </div>
      )}

      {/* Table KPI Statistic 4G */}
      {isPendingKpiStatistic4g && <div className="text-muted-foreground">Loading...</div>}
      {errorKpiStatistic4g && <div className="text-destructive">Error: {errorKpiStatistic4g.message}</div>}

      {!dataKpiStatistic4g || dataKpiStatistic4g.length === 0 ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        <div key={"table-kpi-statistic-4g"} className="overflow-x-auto">
          <div className="font-bold text-lg">1. Statistical Quality</div>
          <div className="mt-2 text-sm">1.1 NE Level Performance</div>
          <div className="flex flex-col">
            <div className="flex flex-row flex-nowrap">
              <div className="w-65.5 shrink-0 border-t border-r border-b border-l p-1 font-bold">KPI</div>
              <div className="flex flex-col">
                <div className="w-143.5 shrink-0 border-t border-r border-b p-1 text-center">Site Name</div>
                <div className="flex flex-row">
                  <div className="flex flex-col">
                    <div className="flex flex-row">
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Day-1</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Day-2</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Day-3</div>
                    </div>
                    <div className="flex flex-row">
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Tanggal-1</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Tanggal-2</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Tanggal-3</div>
                    </div>
                  </div>
                  <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Average</div>
                  <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Target</div>
                  <div className="w-20.5 shrink-0 text-wrap border-t border-r border-b p-1 text-center">
                    Impro vement
                  </div>
                  <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Result</div>
                </div>
              </div>
            </div>
            {dataKpiStatistic4g.map((item) => (
              <div key={item.kpi_index} className="flex flex-row flex-nowrap">
                <div className="w-65.5 shrink-0 border-t border-r border-b border-l p-1 font-bold">{item.kpi_name}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item.day1_val}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item.day2_val}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item.day3_val}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item.average}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item.target}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item.delta}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item.remark}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Kpi Statistic 4G tier site */}

      {/* Table Information 2G */}

      {!dataSqacTracker || dataSqacTracker.length === 0 ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        dataSqacTracker.map((item) => (
          <div key={"table-1"} className="mt-12">
            <div className="font-bold text-lg">2G SITE QUALITY ACCEPTANCE CERTIFICATE</div>
            <div className="flex flex-col">
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-t border-r border-b border-l p-1 font-bold">Site ID</div>
                <div className="w-62.5 shrink-0 border-t border-r border-b p-1 text-center">{item.siteid}</div>
                <div className="w-37.5 shrink-0 border-t border-r border-b p-1 font-bold">Band SOW</div>
                <div className="w-62.5 shrink-0 border-t border-r border-b p-1 text-center">{item.band_2g_sow}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">Site Name</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.site_name_2g}</div>
                <div className="w-37.5 shrink-0 border-r border-b p-1 font-bold">Site No.</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.site_no_2g}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">LAC</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.lac_2g}</div>
                <div className="w-37.5 shrink-0 border-r border-b p-1 font-bold">CI</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.cell_id_2g}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">Detail SOW</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.type_of_work}</div>
                <div className="w-37.5 shrink-0 border-r border-b p-1 font-bold">Band</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.band_2g_sow}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">Kabupaten</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.kabupaten}</div>
                <div className="w-37.5 shrink-0 border-r border-b p-1 font-bold">Connected Date</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.connected}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">Site Longitude</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.longitude}</div>
                <div className="w-37.5 shrink-0 border-r border-b p-1 font-bold">Integrated Date</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.connected}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">Site Latitude</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.latitude}</div>
                <div className="w-37.5 shrink-0 border-r border-b p-1 font-bold">TRX Configuration</div>
                <div className="w-62.5 shrink-0 border-r border-b p-1 text-center">{item.trx_configuration}</div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Target KPI Statistic 2G */}
      {isPendingTargetKpiStatistic2g && <div className="text-muted-foreground">Loading...</div>}
      {errorTargetKpiStatistic2g && <div className="text-destructive">Error: {errorTargetKpiStatistic2g.message}</div>}

      {!dataTargetKpiStatistic2g || dataTargetKpiStatistic2g.length === 0 ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        <div key={"table-target-kpi-2g"} className="overflow-x-auto">
          <div className="flex flex-row flex-nowrap">
            <div className="w-20.5 shrink-0 border-t border-r border-b border-l p-1">City</div>
            <div className="w-20.5 shrink-0 border-t border-r border-b border-l p-1">Band</div>
            <div className="flex flex-col">
              <div className="flex flex-row">
                <div className="flex flex-col">
                  <div className="border-t border-r border-b p-1 text-center">KPI ACCEPTANCE (ACCEPTANCE VALUE)</div>
                  <div className="flex flex-row">
                    <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">SDSR (%)</div>
                    <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">HOSR (%)</div>
                    <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">DCR (%)</div>
                    <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">TBF DL EST SR (%)</div>
                    <div className="wrap-break-word w-20.5 border-t border-r border-b p-1 text-center">
                      TBF COMPLETION SR (%)
                    </div>
                    <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">ICM BAND (0-5)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="w-20.5 shrink-0 text-wrap border-t border-r border-b border-l p-1 text-center">LUWU</div>
            <div className="w-20.5 shrink-0 text-wrap border-t border-r border-b p-1 text-center">L900</div>
            <div className="w-20.5 shrink-0 text-wrap border-t border-r border-b border-l p-1 text-center">
              {dataTargetKpiStatistic2g[0]["SDSR (%)"] || ""}
            </div>
            <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic2g[0]["HOSR (%)"] || ""}
            </div>
            <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic2g[0]["DCR (%)"] || ""}
            </div>
            <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic2g[0]["TBF DL EST SR (%)"] || ""}
            </div>
            <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic2g[0]["TBF COMPLETION SR (%)"] || ""}
            </div>
            <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic2g[0]["ICM BAND (0-5)"] || "95.00"}
            </div>
          </div>
        </div>
      )}

      {/* Table KPI Statistic 2G */}
      {isPendingKpiStatistic2g && <div className="text-muted-foreground">Loading...</div>}
      {errorKpiStatistic2g && <div className="text-destructive">Error: {errorKpiStatistic2g.message}</div>}

      {!dataKpiStatistic2g || dataKpiStatistic2g.length === 0 ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        <div key={"table-kpi-statistic-2g"} className="overflow-x-auto">
          <div className="mt-2 text-sm">Site Level Performance</div>
          <div className="flex flex-col">
            <div className="flex flex-row flex-nowrap">
              <div className="w-28 shrink-0 border-t border-r border-b border-l p-1">Date</div>
              <div className="w-28 shrink-0 border-t border-r border-b border-l p-1">Calendar Day</div>
              <div className="flex flex-col">
                <div className="border-t border-r border-b p-1 text-center">KPI Parameters</div>
                <div className="flex flex-row">
                  <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">Site Avail (%)</div>
                  <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">SDSR (%)</div>
                  <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">HOSR (%)</div>
                  <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">TBF UL EST SR (%)</div>
                  <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">TBF DL EST SR (%)</div>
                  <div className="wrap-break-word w-16 border-t border-r border-b p-1 text-center">
                    TBF COMPLETION SR (%)
                  </div>
                  <div className="wrap-break-word w-16 border-t border-r border-b p-1 text-center">UTILIZATION (%)</div>
                  <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">BH Traffic (Erl)</div>
                  <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">Payload (MB)</div>
                  <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">ICM BAND (0-5)</div>
                </div>
              </div>
            </div>
            {dataKpiStatistic2g.map((item) => (
              <div key={item.sort} className="flex flex-row flex-nowrap">
                <div className="w-28 shrink-0 border-t border-r border-b border-l p-1">{item.Date}</div>
                <div className="w-28 shrink-0 border-t border-r border-b p-1 text-center">
                  {formatDayName(item.Date)}
                </div>
                <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["Site Avail (%)"])}
                </div>
                <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["SDSR (%)"])}
                </div>
                <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["HOSR (%)"])}
                </div>
                <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["DCR (%)"])}
                </div>
                <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["TBF UL EST SR (%)"])}
                </div>
                <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["TBF DL EST SR (%)"])}
                </div>
                <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["Utilization (%)"])}
                </div>
                <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["BH Traffic (Erl)"])}
                </div>
                <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["Payload (MB)"])}
                </div>
                <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["ICM BAND (0-5)"])}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Productivity Payload */}
      {isPendingProductivityPayload && <div className="text-muted-foreground">Loading...</div>}
      {errorProductivityPayload && <div className="text-destructive">Error: {errorProductivityPayload.message}</div>}

      {!dataProductivityPayload || dataProductivityPayload.length === 0 ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        <div key={"table-productivity-payload"} className="overflow-x-auto">
          <div className="font-bold text-lg">2. Productivity Info</div>
          <div className="mt-2 text-sm">2.1 Productivity Information Payload</div>
          <div className="flex flex-col">
            <div className="flex flex-row flex-nowrap">
              <div className="w-40 shrink-0 border-t border-r border-b border-l p-1">KPI</div>
              <div className="flex shrink-0 flex-col">
                <div className="w-205 border-t border-r border-b p-1 text-center">Productivity Payload</div>
                <div className="flex flex-row">
                  <div className="flex flex-col">
                    <div className="flex flex-row">
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Day-1</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Day-2</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Day-3</div>
                    </div>
                    <div className="flex flex-row">
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{beforeDay1}</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{beforeDay2}</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{beforeDay3}</div>
                    </div>
                  </div>
                  <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Average Before</div>
                  <div className="flex flex-col">
                    <div className="flex flex-row">
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Day-1</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Day-2</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Day-3</div>
                    </div>
                    <div className="flex flex-row">
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{afterDay1}</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{afterDay2}</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{afterDay3}</div>
                    </div>
                  </div>
                  <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Average After</div>
                  <div className="w-20.5 shrink-0 text-wrap border-t border-r border-b p-1 text-center">Growth</div>
                  <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Result</div>
                </div>
              </div>
            </div>
            {dataProductivityPayload.map((item) => (
              <div key={item.sort} className="flex flex-row flex-nowrap">
                <div className="shrink-0 basis-40 border-t border-r border-b border-l p-1">{item.KPI}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item["Day-1 Before"]}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item["Day-2 Before"]}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item["Day-3 Before"]}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
                  {item["Average Before"]}
                </div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item["Day-1 After"]}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item["Day-2 After"]}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item["Day-3 After"]}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
                  {item["Average After"]}
                </div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item.Growth}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item.Result}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Productivity Traffic */}
      {isPendingProductivityTraffic && <div className="text-muted-foreground">Loading...</div>}
      {errorProductivityTraffic && <div className="text-destructive">Error: {errorProductivityTraffic.message}</div>}

      {!dataProductivityTraffic || dataProductivityTraffic.length === 0 ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        <div key={"table-productivity-traffic"} className="overflow-x-auto">
          <div className="mt-2 text-sm">2.2 Productivity Information Traffic</div>
          <div className="flex flex-col">
            <div className="flex flex-row flex-nowrap">
              <div className="w-40 shrink-0 border-t border-r border-b border-l p-1">KPI</div>
              <div className="flex shrink-0 flex-col">
                <div className="w-205 border-t border-r border-b p-1 text-center">Productivity Traffic</div>
                <div className="flex flex-row">
                  <div className="flex flex-col">
                    <div className="flex flex-row">
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Day-1</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Day-2</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Day-3</div>
                    </div>
                    <div className="flex flex-row">
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{beforeDay1}</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{beforeDay2}</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{beforeDay3}</div>
                    </div>
                  </div>
                  <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Average Before</div>
                  <div className="flex flex-col">
                    <div className="flex flex-row">
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Day-1</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Day-2</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Day-3</div>
                    </div>
                    <div className="flex flex-row">
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{afterDay1}</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{afterDay2}</div>
                      <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{afterDay3}</div>
                    </div>
                  </div>
                  <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Average After</div>
                  <div className="w-20.5 shrink-0 text-wrap border-t border-r border-b p-1 text-center">Growth</div>
                  <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">Result</div>
                </div>
              </div>
            </div>
            {dataProductivityTraffic.map((item) => (
              <div key={item.sort} className="flex flex-row flex-nowrap">
                <div className="shrink-0 basis-40 border-t border-r border-b border-l p-1">{item.KPI}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item["Day-1 Before"]}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item["Day-2 Before"]}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item["Day-3 Before"]}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
                  {item["Average Before"]}
                </div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item["Day-1 After"]}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item["Day-2 After"]}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item["Day-3 After"]}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">
                  {item["Average After"]}
                </div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item.Growth}</div>
                <div className="w-20.5 shrink-0 border-t border-r border-b p-1 text-center">{item.Result}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart Payload THP User */}
      {isPendingPayloadThpUser && <div className="text-muted-foreground">Loading...</div>}
      {errorPayloadThpUser && <div className="text-destructive">Error: {errorPayloadThpUser.message}</div>}

      {dataPayloadThpUser && dataPayloadThpUser.length > 0 && dataGetActivityLog && dataGetActivityLog.length > 0 && (
        <div key={"chart-payload-thp-user"} className="mt-16">
          <div className="font-bold text-lg">3. Chart Productivity</div>
          <div className="mt-2 text-sm">3.1. LTE Payload, Max DL Throughput & User Number LTE</div>
          <div className="">
            {uniqueSector
              .sort((a, b) => a.localeCompare(b))
              .map((item) => (
                <ChartPayloadThpUser
                  key={item}
                  ref={(ref) => {
                    if (ref) {
                      chartPayloadThpUserRefs.current.set(item, ref);
                    } else {
                      chartPayloadThpUserRefs.current.delete(item);
                    }
                  }}
                  data={dataPayloadThpUser}
                  sector={item}
                  dataActivityLog={dataGetActivityLog}
                />
              ))}
          </div>
        </div>
      )}

      {/* Chart Payload Band Site SOW */}
      {isPendingPayloadBandSiteSow && <div className="text-muted-foreground">Loading...</div>}
      {errorPayloadBandSiteSow && <div className="text-destructive">Error: {errorPayloadBandSiteSow.message}</div>}

      {dataPayloadBandSiteSow &&
        dataPayloadBandSiteSow.length > 0 &&
        dataGetActivityLog &&
        dataGetActivityLog.length > 0 && (
          <div key={"chart-payload-band-site-sow"} className="mt-16">
            <div className="mt-2 text-sm">3.2. Total Payload Site Level & Payload 1st tier Site Level</div>
            <ChartPayloadBandSiteSow
              ref={chartPayloadBandSiteSowRef}
              data={dataPayloadBandSiteSow}
              legendBy={"band"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
        )}

      {/* Chart Payload Band Site Tier */}
      {isPendingPayloadBandSiteTier && <div className="text-muted-foreground">Loading...</div>}
      {errorPayloadBandSiteTier && <div className="text-destructive">Error: {errorPayloadBandSiteTier.message}</div>}

      {dataPayloadBandSiteTier &&
        dataPayloadBandSiteTier.length > 0 &&
        dataGetActivityLog &&
        dataGetActivityLog.length > 0 && (
          <div key={"chart-payload-band-site-tier"} className="mt-16">
            <ChartPayloadBandSiteSow
              ref={chartPayloadBandSiteTierRef}
              data={dataPayloadBandSiteTier}
              legendBy={"site"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
        )}

      {/* Chart Rrc Utilization */}
      {isPendingRrcUtilization && <div className="text-muted-foreground">Loading...</div>}
      {errorRrcUtilization && <div className="text-destructive">Error: {errorRrcUtilization.message}</div>}

      {dataRrcUtilization && dataRrcUtilization.length > 0 && dataGetActivityLog && dataGetActivityLog.length > 0 && (
        <div key={"chart-rrc-utilization"} className="mt-16">
          <ChartRrcUtilization
            ref={chartRrcUtilizationRef}
            data={dataRrcUtilization}
            dataActivityLog={dataGetActivityLog}
          />
        </div>
      )}

      {/* Chart Payload Band Site SOW */}
      {isPendingPayload2gCellSiteSow && <div className="text-muted-foreground">Loading...</div>}
      {errorPayload2gCellSiteSow && <div className="text-destructive">Error: {errorPayload2gCellSiteSow.message}</div>}

      {dataPayload2gCellSiteSow &&
        dataPayload2gCellSiteSow.length > 0 &&
        dataGetActivityLog &&
        dataGetActivityLog.length > 0 && (
          <div key={"chart-payload-2g-cell-site-sow"} className="mt-16">
            <div className="mt-2 text-sm">3.7. Payload Cell Level & Site Level 2G</div>
            <ChartPayloadBandSiteSow
              ref={chartPayload2gCellSiteSowRef}
              data={dataPayload2gCellSiteSow}
              legendBy={"cell2g"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
        )}

      {/* Chart Payload 2G Site Tier */}
      {isPendingPayload2gSiteTier && <div className="text-muted-foreground">Loading...</div>}
      {errorPayload2gSiteTier && <div className="text-destructive">Error: {errorPayload2gSiteTier.message}</div>}

      {dataPayload2gSiteTier &&
        dataPayload2gSiteTier.length > 0 &&
        dataGetActivityLog &&
        dataGetActivityLog.length > 0 && (
          <div key={"chart-payload-2g-site-tier"} className="mt-16">
            <div className="mt-2 text-sm">3.8. Payload Site Level & Cluster Level 2G</div>
            <ChartPayloadBandSiteSow
              ref={chartPayload2gSiteTierRef}
              data={dataPayload2gSiteTier}
              legendBy={"site"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
        )}

      {/* Chart Traffic Mini Cluster */}
      {isPendingTrafficMiniCluster && <div className="text-muted-foreground">Loading...</div>}
      {errorTrafficMiniCluster && <div className="text-destructive">Error: {errorTrafficMiniCluster.message}</div>}

      {dataTrafficMiniCluster &&
        dataTrafficMiniCluster.length > 0 &&
        dataGetActivityLog &&
        dataGetActivityLog.length > 0 && (
          <div key={"chart-traffic-mini-cluster"} className="mt-16">
            <div className="mt-2 text-sm">4.1. Total Traffic Mini Cluster 2G-4G</div>
            <ChartPayloadBandSiteSow
              ref={chartTrafficMiniClusterRef}
              data={dataTrafficMiniCluster}
              legendBy={"cluster"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
        )}

      {/* Chart Payload Mini Cluster */}
      {isPendingPayloadMiniCluster && <div className="text-muted-foreground">Loading...</div>}
      {errorPayloadMiniCluster && <div className="text-destructive">Error: {errorPayloadMiniCluster.message}</div>}

      {dataPayloadMiniCluster &&
        dataPayloadMiniCluster.length > 0 &&
        dataGetActivityLog &&
        dataGetActivityLog.length > 0 && (
          <div key={"chart-payload-mini-cluster"} className="mt-16">
            <div className="mt-2 text-sm">4.2. Total Payload Mini Cluster 2G-4G</div>
            <ChartPayloadBandSiteSow
              ref={chartPayloadMiniClusterRef}
              data={dataPayloadMiniCluster}
              legendBy={"cluster"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
        )}

      {/* Table PRB Utilization */}
      {isPendingTablePrbUtilization && <div className="text-muted-foreground">Loading...</div>}
      {errorTablePrbUtilization && <div className="text-destructive">Error: {errorTablePrbUtilization.message}</div>}

      {!dataTablePrbUtilization || dataTablePrbUtilization.length === 0 ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        <div key={"table-prb-utilization"} className="overflow-x-auto">
          <div className="mt-2 text-sm">PRB Utilization</div>
          <div className="flex flex-col">
            <div className="flex flex-row flex-nowrap">
              <div className="flex h-35.5 w-20 shrink-0 items-center justify-center border-t border-r border-b border-l p-1">
                <span style={{ transform: "rotate(270deg)" }}>Site ID</span>
              </div>
              <div className="flex h-35.5 w-20 shrink-0 items-center justify-center border-t border-r border-b border-l p-1">
                <span style={{ transform: "rotate(270deg)" }}>Sector</span>
              </div>
              <div className="flex h-35.5 w-15 shrink-0 items-center justify-center border-t border-r border-b border-l p-1">
                <span style={{ transform: "rotate(270deg)" }}>Band Combination</span>
              </div>
              <div className="flex shrink-0 flex-col">
                <div className="flex flex-row">
                  <div className="flex flex-col">
                    <div className="border-t border-r border-b p-1 text-center">PRB Actual</div>
                    <div className="flex flex-row">
                      <div className="flex h-28 w-15 shrink-0 items-center justify-center border-t border-r border-b p-1 text-center">
                        <span style={{ transform: "rotate(270deg)" }}>L900</span>
                      </div>
                      <div className="flex h-28 w-15 shrink-0 items-center justify-center border-t border-r border-b p-1 text-center">
                        <span style={{ transform: "rotate(270deg)" }}>L1800</span>
                      </div>
                      <div className="flex h-28 w-15 shrink-0 items-center justify-center border-t border-r border-b p-1 text-center">
                        <span style={{ transform: "rotate(270deg)" }}>L2100</span>
                      </div>
                      <div className="flex h-28 w-15 shrink-0 items-center justify-center border-t border-r border-b p-1 text-center">
                        <span style={{ transform: "rotate(270deg)" }}>L2300</span>
                      </div>
                      <div className="flex h-28 w-15 shrink-0 items-center justify-center border-t border-r border-b p-1 text-center">
                        <span style={{ transform: "rotate(270deg)" }}>Max PRB</span>
                      </div>
                      <div className="flex h-28 w-15 shrink-0 items-center justify-center border-t border-r border-b p-1 text-center">
                        <span style={{ transform: "rotate(270deg)" }}>Min PRB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="border-t border-r border-b p-1 text-center">Gap PRB</div>
                    <div className="flex flex-row">
                      <div className="flex h-28 w-15 shrink-0 items-center justify-center border-t border-r border-b p-1 text-center">
                        <span style={{ transform: "rotate(270deg)" }}>L900</span>
                      </div>
                      <div className="flex h-28 w-15 shrink-0 items-center justify-center border-t border-r border-b p-1 text-center">
                        <span style={{ transform: "rotate(270deg)" }}>L1800</span>
                      </div>
                      <div className="flex h-28 w-15 shrink-0 items-center justify-center border-t border-r border-b p-1 text-center">
                        <span style={{ transform: "rotate(270deg)" }}>L2100</span>
                      </div>
                      <div className="flex h-28 w-15 shrink-0 items-center justify-center border-t border-r border-b p-1 text-center">
                        <span style={{ transform: "rotate(270deg)" }}>L2300</span>
                      </div>
                      <div className="flex h-28 w-15 shrink-0 items-center justify-center border-t border-r border-b p-1 text-center">
                        <span style={{ transform: "rotate(270deg)" }}>Max GAP PRB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {dataTablePrbUtilization.map((item) => (
              <div key={item.Sector} className="flex flex-row flex-nowrap">
                <div className="shrink-0 basis-20 border-t border-r border-b border-l p-1">{item["Site ID"]}</div>
                <div className="w-20 shrink-0 border-t border-r border-b p-1 text-center">{item["Sector"]}</div>
                <div className="w-15 shrink-0 border-t border-r border-b p-1 text-center">
                  {item["Band Combination"]}
                </div>
                <div className="w-15 shrink-0 border-t border-r border-b p-1 text-center">{item["L900"]}</div>
                <div className="w-15 shrink-0 border-t border-r border-b p-1 text-center">{item["L1800"]}</div>
                <div className="w-15 shrink-0 border-t border-r border-b p-1 text-center">{item["L2100"]}</div>
                <div className="w-15 shrink-0 border-t border-r border-b p-1 text-center">{item["L2300"]}</div>
                <div className="w-15 shrink-0 border-t border-r border-b p-1 text-center">{item["Max PRB"]}</div>
                <div className="w-15 shrink-0 border-t border-r border-b p-1 text-center">{item["Min PRB"]}</div>
                <div className="w-15 shrink-0 border-t border-r border-b p-1 text-center">{item["Gap L900"]}</div>
                <div className="w-15 shrink-0 border-t border-r border-b p-1 text-center">{item["Gap L1800"]}</div>
                <div className="w-15 shrink-0 border-t border-r border-b p-1 text-center">{item["Gap L2100"]}</div>
                <div className="w-15 shrink-0 border-t border-r border-b p-1 text-center">{item["Gap L2300"]}</div>
                <div className="w-15 shrink-0 border-t border-r border-b p-1 text-center">{item["Max GAP PRB"]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart Payload Cell Per Sector*/}
      {isPendingPayload4gCellSow && <div className="text-muted-foreground">Loading...</div>}
      {errorPayload4gCellSow && <div className="text-destructive">Error: {errorPayload4gCellSow.message}</div>}

      {/* Chart Payload Cell Per Sector*/}
      {isPendingUtilization4gCellSow && <div className="text-muted-foreground">Loading...</div>}
      {errorUtilization4gCellSow && <div className="text-destructive">Error: {errorUtilization4gCellSow.message}</div>}

      {dataPayload4gCellSow &&
        dataPayload4gCellSow.length > 0 &&
        dataUtilization4gCellSow &&
        dataUtilization4gCellSow.length > 0 &&
        dataGetActivityLog &&
        dataGetActivityLog.length > 0 && (
          <div key={"chart-payload-cell-per-sector"} className="mt-16">
            <div>
              {uniqueSector
                .sort((a, b) => a.localeCompare(b))
                .map((item) => (
                  <div key={item} className="flex flex-row">
                    <ChartPayloadBandCellSow
                      ref={(ref) => {
                        if (ref) {
                          chartUtilization4gCellSowRefs.current.set(item, ref);
                        } else {
                          chartUtilization4gCellSowRefs.current.delete(item);
                        }
                      }}
                      data={dataUtilization4gCellSow}
                      filter_by={item}
                      legendBy={"util-4g"}
                      dataActivityLog={dataGetActivityLog}
                    />
                    <ChartPayloadBandCellSow
                      ref={(ref) => {
                        if (ref) {
                          chartPayload4gCellSowRefs.current.set(item, ref);
                        } else {
                          chartPayload4gCellSowRefs.current.delete(item);
                        }
                      }}
                      data={dataPayload4gCellSow}
                      filter_by={item}
                      legendBy={"payload-4g"}
                      dataActivityLog={dataGetActivityLog}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
    </div>
  );
}

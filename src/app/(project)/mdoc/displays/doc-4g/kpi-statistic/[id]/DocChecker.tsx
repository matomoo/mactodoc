"use client";

import { useRef } from "react";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Minus, XCircle } from "lucide-react";

interface ChartFile {
  filename: string;
  path: string;
}

interface DocCheckerProps {
  wid?: string;
}

interface CheckResult {
  table: string;
  count: number;
  status: "has_data" | "no_data" | "error";
  error?: string;
}

// Expected images for KPI Statistic page
const KPI_STATISTIC_IMAGES = [
  { key: "table-sqac-info", label: "Table SQAC Info" },
  { key: "table-target-kpi-4g", label: "Table Target KPI 4G" },
  { key: "table-kpi-statistic-4g", label: "Table KPI Statistic 4G" },
  { key: "table-sqac-information-2g", label: "Table SQAC Information 2G" },
  { key: "table-target-kpi-2g", label: "Table Target KPI 2G" },
  { key: "table-kpi-statistic-2g", label: "Table KPI Statistic 2G" },
  { key: "table-productivity-payload", label: "Table Productivity Payload" },
  { key: "table-productivity-traffic", label: "Table Productivity Traffic" },
  { key: "table-prb-utilization-4g", label: "Table PRB Utilization 4G" },
];

// Expected images for Clear Alarm page
const CLEAR_ALARM_IMAGES = [
  { key: "table-clear-alarm-info-4g", label: "Table Clear Alarm Info 4G" },
  { key: "table-activity-log-4g", label: "Table Activity Log 4G" },
];

// 4G KPI Charts
const KPI_4G_CHARTS = [
  { key: "chart-kpi-4g-availability", label: "KPI 4G Availability" },
  { key: "chart-kpi-4g-rrc_setup", label: "KPI 4G RRC Setup" },
  { key: "chart-kpi-4g-erab_setup", label: "KPI 4G E-RAB Setup" },
  { key: "chart-kpi-4g-cssr", label: "KPI 4G CSSR" },
  { key: "chart-kpi-4g-erab_drop", label: "KPI 4G E-RAB Drop" },
  { key: "chart-kpi-4g-ifho", label: "KPI 4G IFHO" },
  { key: "chart-kpi-4g-csfb", label: "KPI 4G CSFB" },
  { key: "chart-kpi-4g-cqi_average", label: "KPI 4G CQI Average" },
  { key: "chart-kpi-4g-se2", label: "KPI 4G SE2" },
  { key: "chart-kpi-4g-number_csfb", label: "KPI 4G Number CSFB" },
  { key: "chart-kpi-4g-ni_carrier", label: "KPI 4G NI Carrier" },
  { key: "chart-kpi-4g-rssi", label: "KPI 4G RSSI" },
  { key: "chart-kpi-4g-payload_ca", label: "KPI 4G Payload CA" },
];

// 2G KPI Charts
const KPI_2G_CHARTS = [
  { key: "chart-kpi-2g-availability", label: "KPI 2G Availability" },
  { key: "chart-kpi-2g-sdsr", label: "KPI 2G SDSR" },
  { key: "chart-kpi-2g-hosr", label: "KPI 2G HOSR" },
  { key: "chart-kpi-2g-dcr", label: "KPI 2G DCR" },
  { key: "chart-kpi-2g-tbf_dl", label: "KPI 2G TBF DL" },
  { key: "chart-kpi-2g-tbf_comp", label: "KPI 2G TBF Comp" },
  { key: "chart-kpi-2g-fast_return_lte", label: "KPI 2G Fast Return LTE" },
];

export default function DocChecker({ wid }: DocCheckerProps) {
  const docCheckerRef = useRef<HTMLDivElement>(null);

  // Check activity_log
  const {
    data: activityLogCount = 0,
    isPending: activityPending,
    error: activityError,
  } = useQuery<number>({
    queryKey: ["activity-log-count", wid],
    queryFn: async () => {
      const url = wid ? `/mdoc/api/v1/activity-log?wid=${encodeURIComponent(wid)}` : "/mdoc/api/v1/activity-log";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      return data.length;
    },
  });

  // Check sqac_first_tier
  const {
    data: sqacFirstTierCount = 0,
    isPending: sqacPending,
    error: sqacError,
  } = useQuery<number>({
    queryKey: ["sqac-first-tier-count", wid],
    queryFn: async () => {
      const url = wid ? `/mdoc/api/v1/sqac-first-tier?wid=${encodeURIComponent(wid)}` : "/mdoc/api/v1/sqac-first-tier";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      return data.length;
    },
  });

  // Fetch exported images for this WID
  const { data: exportedImages = [], isPending: imagesPending } = useQuery<ChartFile[]>({
    queryKey: ["chart-list", wid],
    queryFn: async () => {
      const url = wid ? `/mdoc/api/v1/chart-list?wid=${encodeURIComponent(wid)}` : "/mdoc/api/v1/chart-list";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      return response.json();
    },
    enabled: !!wid,
  });

  const isPending = activityPending || sqacPending || imagesPending;

  // Build exported images map for quick lookup
  const exportedImagesMap = new Map<string, ChartFile>();
  exportedImages.forEach((img) => {
    // Extract the key - find patterns starting with chart- or table-
    // filename format: {wid}-{key}.jpg where wid can contain dashes
    // e.g., PLP171-R09239614-chart-kpi-4g-availability.jpg -> chart-kpi-4g-availability
    if (img.filename.includes("-chart-")) {
      const match = img.filename.match(/(chart-[^.]+)\.jpg$/);
      if (match) {
        exportedImagesMap.set(match[1], img);
      }
    } else if (img.filename.includes("-table-")) {
      const match = img.filename.match(/(table-[^.]+)\.jpg$/);
      if (match) {
        exportedImagesMap.set(match[1], img);
      }
    } else if (img.filename.includes("-doc_checker")) {
      exportedImagesMap.set("doc_checker", img);
    }
  });

  // Check if table images exist
  const tableChecks: CheckResult[] = KPI_STATISTIC_IMAGES.map((item) => {
    const hasImage = exportedImagesMap.has(item.key);
    return {
      table: item.label,
      count: hasImage ? 1 : 0,
      status: hasImage ? "has_data" : "no_data",
    };
  });

  // Check if clear alarm table images exist
  const clearAlarmChecks: CheckResult[] = CLEAR_ALARM_IMAGES.map((item) => {
    const hasImage = exportedImagesMap.has(item.key);
    return {
      table: item.label,
      count: hasImage ? 1 : 0,
      status: hasImage ? "has_data" : "no_data",
    };
  });

  // Check if 4G KPI chart images exist
  const kpi4gChecks: CheckResult[] = KPI_4G_CHARTS.map((item) => {
    const hasImage = exportedImagesMap.has(item.key);
    return {
      table: item.label,
      count: hasImage ? 1 : 0,
      status: hasImage ? "has_data" : "no_data",
    };
  });

  // Check if 2G KPI chart images exist
  const kpi2gChecks: CheckResult[] = KPI_2G_CHARTS.map((item) => {
    const hasImage = exportedImagesMap.has(item.key);

    return {
      table: item.label,
      count: hasImage ? 1 : 0,
      status: hasImage ? "has_data" : "no_data",
    };
  });

  // Overall data checks
  const dataChecks: CheckResult[] = [
    {
      table: "Activity Log",
      count: activityLogCount,
      status: activityError ? "error" : activityLogCount > 0 ? "has_data" : "no_data",
      error: activityError?.message,
    },
    {
      table: "SQAC First Tier",
      count: sqacFirstTierCount,
      status: sqacError ? "error" : sqacFirstTierCount > 0 ? "has_data" : "no_data",
      error: sqacError?.message,
    },
  ];

  const allDataHaveData = dataChecks.every((c) => c.status === "has_data");
  const allDataNoData = dataChecks.every((c) => c.status === "no_data");

  const allTablesComplete = tableChecks.every((c) => c.status === "has_data");
  const noTablesExist = tableChecks.every((c) => c.status === "no_data");

  const allClearAlarmsComplete = clearAlarmChecks.every((c) => c.status === "has_data");
  const noClearAlarmsExist = clearAlarmChecks.every((c) => c.status === "no_data");

  const allKpi4gComplete = kpi4gChecks.every((c) => c.status === "has_data");
  const noKpi4gExist = kpi4gChecks.every((c) => c.status === "no_data");

  const allKpi2gComplete = kpi2gChecks.every((c) => c.status === "has_data");
  const noKpi2gExist = kpi2gChecks.every((c) => c.status === "no_data");

  const renderCheckItem = (check: CheckResult) => (
    <div
      key={check.table}
      className={`flex items-center justify-between rounded border p-2 ${
        check.status === "has_data"
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
          : check.status === "error"
            ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
            : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
      }`}
    >
      <span className="text-sm">{check.table}</span>
      {check.status === "has_data" && <CheckCircle className="h-4 w-4 text-green-600" aria-label="Has image" />}
      {check.status === "no_data" && <Minus className="h-4 w-4 text-yellow-600" aria-label="No image" />}
      {check.status === "error" && <XCircle className="h-4 w-4 text-red-600" aria-label="Error" />}
    </div>
  );

  const renderSection = (title: string, checks: CheckResult[], isComplete: boolean, isEmpty: boolean) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">{title}</h3>
        <span
          className={`rounded px-2 py-0.5 font-medium text-xs ${
            isEmpty
              ? "bg-muted text-muted-foreground"
              : isComplete
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}
        >
          {isEmpty ? "No Image" : isComplete ? "Complete" : "Incomplete"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">{checks.map(renderCheckItem)}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl">Document Checker</h2>
        <div
          className={`rounded px-3 py-1 font-medium text-sm ${
            isPending
              ? "bg-muted text-muted-foreground"
              : allDataHaveData
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : allDataNoData
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}
        >
          {isPending ? "Checking..." : allDataHaveData ? "Complete" : allDataNoData ? "No Data" : "Incomplete"}
        </div>
      </div>

      <div ref={docCheckerRef} className="space-y-6">
        {/* Data Status */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Data Status</h3>
          <div className="grid grid-cols-2 gap-2">{dataChecks.map(renderCheckItem)}</div>
        </div>

        {/* Tables */}
        {renderSection("Tables", tableChecks, allTablesComplete, noTablesExist)}

        {/* Clear Alarm Tables */}
        {renderSection("Clear Alarm Tables", clearAlarmChecks, allClearAlarmsComplete, noClearAlarmsExist)}

        {/* KPI 4G Charts */}
        {renderSection("KPI 4G Charts", kpi4gChecks, allKpi4gComplete, noKpi4gExist)}

        {/* KPI 2G Charts */}
        {renderSection("KPI 2G Charts", kpi2gChecks, allKpi2gComplete, noKpi2gExist)}

        {!isPending && allDataNoData && noTablesExist && noClearAlarmsExist && noKpi4gExist && noKpi2gExist && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
            <p className="font-medium text-lg text-red-800 dark:text-red-200">No Data</p>
            <p className="mt-1 text-red-600 text-sm dark:text-red-400">
              No activity log or SQAC first tier data found for this site.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

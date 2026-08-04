"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Minus, XCircle } from "lucide-react";

interface DocCheckerProps {
  wid?: string;
}

interface CheckResult {
  table: string;
  count: number;
  status: "has_data" | "no_data" | "error";
  error?: string;
}

export default function DocChecker({ wid }: DocCheckerProps) {
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

  const isPending = activityPending || sqacPending;

  const checks: CheckResult[] = [
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

  const allHaveData = checks.every((c) => c.status === "has_data");
  const allNoData = checks.every((c) => c.status === "no_data");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl">Document Checker</h2>
        <div
          className={`rounded px-3 py-1 font-medium text-sm ${
            isPending
              ? "bg-muted text-muted-foreground"
              : allHaveData
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : allNoData
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}
        >
          {isPending ? "Checking..." : allHaveData ? "Complete" : allNoData ? "No Data" : "Incomplete"}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {checks.map((check) => (
          <div
            key={check.table}
            className={`rounded-lg border p-4 ${
              check.status === "has_data"
                ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                : check.status === "error"
                  ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                  : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{check.table}</span>
              {check.status === "has_data" && <CheckCircle className="h-5 w-5 text-green-600" aria-label="Has data" />}
              {check.status === "no_data" && <Minus className="h-5 w-5 text-yellow-600" aria-label="No data" />}
              {check.status === "error" && <XCircle className="h-5 w-5 text-red-600" aria-label="Error" />}
            </div>
            <p className="mt-1 text-muted-foreground text-sm">
              {isPending && check.count === 0 ? (
                "Loading..."
              ) : check.status === "has_data" ? (
                <span className="text-green-600 dark:text-green-400">
                  {check.count} row{check.count !== 1 ? "s" : ""} found
                </span>
              ) : check.status === "error" ? (
                <span className="text-red-600 dark:text-red-400">{check.error}</span>
              ) : (
                <span className="text-yellow-600 dark:text-yellow-400">No data</span>
              )}
            </p>
          </div>
        ))}
      </div>

      {!isPending && allNoData && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
          <p className="font-medium text-lg text-red-800 dark:text-red-200">No Data</p>
          <p className="mt-1 text-red-600 text-sm dark:text-red-400">
            No activity log or SQAC first tier data found for this site.
          </p>
        </div>
      )}
    </div>
  );
}

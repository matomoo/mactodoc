"use client";

import { useState } from "react";

import { PDFViewer } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";

import type { DataActivityLog, DataKpiStatistic4g, SqacTrackerItem } from "@/app/(project)/mdoc/def/interfaces";

import SqacPdfDocument from "./SqacKpiPdfDocument";

function KpiPdfViewerComponent({
  data,
  dataActivity,
  wid,
}: {
  data: SqacTrackerItem[];
  dataActivity: DataActivityLog[];
  wid: string;
}) {
  return (
    <PDFViewer width="100%" height={600} style={{ border: "none" }}>
      <SqacPdfDocument data={data} wid={wid} dataActivity={dataActivity} />
    </PDFViewer>
  );
}

export default function TabPdfViewerKpiStatistic({ wid }: { wid: string }) {
  const [beforeDay1, setBeforeDay1] = useState("2026-05-01");
  const [afterDay3, setAfterDay3] = useState("2026-06-03");

  const { data, isPending, error } = useQuery<SqacTrackerItem[]>({
    queryKey: ["sqac-tracker", wid],
    queryFn: async () => {
      const response = await fetch(`/mdoc/api/v1/sqac-tracker?wid=${encodeURIComponent(wid)}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      return response.json();
    },
    enabled: !!wid,
  });

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
    data: dataGetActivityLog,
    isPending: isPendingGetActivityLog,
    error: errorGetActivityLog,
  } = useQuery<DataActivityLog[]>({
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

  if (isPending) return <div className="text-muted-foreground">Loading PDF...</div>;
  if (error) return <div className="text-destructive">Error: {error.message}</div>;
  if (!data || data.length === 0) return <div className="text-muted-foreground">No data to display</div>;

  return (
    <div className="flex h-150 flex-col">
      <KpiPdfViewerComponent data={data} dataActivity={dataGetActivityLog ?? []} wid={wid} />
    </div>
  );
}

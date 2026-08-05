"use client";

import { useState } from "react";

import { PDFViewer } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";

import type {
  DataActivityLog,
  SqacFirstTierItem,
  SqacTrackerItem,
  TaDataItem,
} from "@/app/(project)/mdoc/def/interfaces";

import SqacClearAlarmPdfDocument from "./SqacClearAlarmPdfDocument";

function ClearAlarmPdfViewerComponent({
  data,
  dataActivity,
  dataTa4g,
  dataGetSqacFirstTier,
  dataGetTa4GTier,
  wid,
}: {
  data: SqacTrackerItem[];
  dataActivity: DataActivityLog[];
  dataTa4g: TaDataItem[];
  dataGetSqacFirstTier: SqacFirstTierItem[];
  dataGetTa4GTier: TaDataItem[];
  wid: string;
}) {
  return (
    <PDFViewer width="100%" height={600} style={{ border: "none" }}>
      <SqacClearAlarmPdfDocument
        data={data}
        wid={wid}
        dataActivity={dataActivity}
        dataTa4g={dataTa4g}
        dataGetSqacFirstTier={dataGetSqacFirstTier}
        dataGetTa4GTier={dataGetTa4GTier}
      />
    </PDFViewer>
  );
}

export default function TabPdfViewerClearAlarm({ wid }: { wid: string }) {
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

  const {
    data: dataGetTa4g,
    isPending: isPendingGetTa4g,
    error: errorGetTa4g,
  } = useQuery<TaDataItem[]>({
    queryKey: ["get-ta-4g", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/ta-4g?siteid=${dataSqacTracker?.[0].siteid}&band=${dataSqacTracker?.[0].band_4g_sow}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataGetSqacFirstTier,
    isPending: isPendingGetSqacFirstTier,
    error: errorGetSqacFirstTier,
  } = useQuery<SqacFirstTierItem[]>({
    queryKey: ["get-sqac-first-tier", wid],
    queryFn: async () => {
      const response = await fetch(`/mdoc/api/v1/get-sqac-first-tier?siteid=${dataSqacTracker?.[0].siteid}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataGetTa4GTier,
    isPending: isPendingGetTa4GTier,
    error: errorGetTa4GTier,
  } = useQuery<TaDataItem[]>({
    queryKey: ["get-ta-4g-tier", wid, dataGetSqacFirstTier],
    queryFn: async () => {
      if (!dataGetSqacFirstTier || dataGetSqacFirstTier.length === 0) {
        return [];
      }

      const uniqueSiteids = [...new Set(dataGetSqacFirstTier.map((t) => t.siteid_tier))];

      const results = await Promise.all(
        uniqueSiteids.map(async (siteidTier) => {
          const response = await fetch(
            `/mdoc/api/v1/ta-4g?siteid=${encodeURIComponent(siteidTier)}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
          );
          if (!response.ok) throw new Error("Failed to fetch data");
          const result = await response.json();
          console.log({ result });
          return result.rows;
        }),
      );

      return results.flat();
    },
    enabled: !!wid && !!dataGetSqacFirstTier && dataGetSqacFirstTier.length > 0,
  });

  if (isPending) return <div className="text-muted-foreground">Loading PDF...</div>;
  if (error) return <div className="text-destructive">Error: {error.message}</div>;
  if (!data || data.length === 0) return <div className="text-muted-foreground">No data to display</div>;

  return (
    <div className="flex h-150 flex-col">
      <ClearAlarmPdfViewerComponent
        data={data}
        dataActivity={dataGetActivityLog ?? []}
        dataTa4g={dataGetTa4g ?? []}
        dataGetSqacFirstTier={dataGetSqacFirstTier ?? []}
        dataGetTa4GTier={dataGetTa4GTier ?? []}
        wid={wid}
      />
    </div>
  );
}

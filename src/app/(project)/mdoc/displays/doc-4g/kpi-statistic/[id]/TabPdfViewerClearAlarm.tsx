"use client";

import { Suspense, useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import { PDFViewer, pdf } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  DataActivityLog,
  SqacFirstTierItem,
  SqacTrackerItem,
  TaDataItem,
} from "@/app/(project)/mdoc/def/interfaces";
import { useSqacStore } from "@/stores/sqacStore";

import SqacClearAlarmPdfDocument from "./SqacClearAlarmPdfDocument";

function ClearAlarmPdfViewerComponent({
  data,
  dataActivity,
  dataTa4g,
  dataGetSqacFirstTier,
  dataGetTa4GTier,
  wid,
  baseUrl,
}: {
  data: SqacTrackerItem[];
  dataActivity: DataActivityLog[];
  dataTa4g: TaDataItem[];
  dataGetSqacFirstTier: SqacFirstTierItem[];
  dataGetTa4GTier: TaDataItem[];
  wid: string;
  baseUrl: string;
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
        baseUrl={baseUrl}
      />
    </PDFViewer>
  );
}

function PdfExportHandler({
  data,
  dataActivity,
  dataTa4g,
  dataGetSqacFirstTier,
  dataGetTa4GTier,
  wid,
  baseUrl,
}: {
  data: SqacTrackerItem[];
  dataActivity: DataActivityLog[];
  dataTa4g: TaDataItem[];
  dataGetSqacFirstTier: SqacFirstTierItem[];
  dataGetTa4GTier: TaDataItem[];
  wid: string;
  baseUrl: string;
}) {
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setIsExporting(true);

    const exportPdf = async () => {
      try {
        const doc = (
          <SqacClearAlarmPdfDocument
            data={data}
            wid={wid}
            dataActivity={dataActivity}
            dataTa4g={dataTa4g}
            dataGetSqacFirstTier={dataGetSqacFirstTier}
            dataGetTa4GTier={dataGetTa4GTier}
            baseUrl={baseUrl}
          />
        );

        const blob = await pdf(doc).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${wid}-clear-alarm-report.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("PDF exported successfully!");
      } catch (err) {
        console.error("PDF export error:", err);
        toast.error("Failed to export PDF");
      } finally {
        setIsExporting(false);
      }
    };

    exportPdf();
  }, [data, dataActivity, dataTa4g, dataGetSqacFirstTier, dataGetTa4GTier, wid, baseUrl]);

  if (isExporting) {
    return <div className="text-muted-foreground">Generating PDF...</div>;
  }

  return null;
}

function TabPdfViewerClearAlarmInner({ wid, isExportMode }: { wid: string; isExportMode: boolean }) {
  const { dateStart, dateEnd } = useSqacStore();
  const [baseUrl, setBaseUrl] = useState<string>("");

  // Set baseUrl on client side (for Docker compatibility)
  if (typeof window !== "undefined" && !baseUrl) {
    setBaseUrl(window.location.origin);
  }

  const beforeDay1 = dateStart ?? "";
  const afterDay3 = dateEnd ?? "";

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

  if (
    isPending ||
    isPendingSqacTracker ||
    isPendingGetActivityLog ||
    isPendingGetTa4g ||
    isPendingGetSqacFirstTier ||
    isPendingGetTa4GTier
  ) {
    return <div className="text-muted-foreground">Loading PDF...</div>;
  }
  if (error || errorSqacTracker || errorGetActivityLog || errorGetTa4g || errorGetSqacFirstTier || errorGetTa4GTier) {
    const errMsg =
      error?.message ||
      errorSqacTracker?.message ||
      errorGetActivityLog?.message ||
      errorGetTa4g?.message ||
      errorGetSqacFirstTier?.message ||
      errorGetTa4GTier?.message;
    return <div className="text-destructive">Error: {errMsg}</div>;
  }
  if (!data || data.length === 0) return <div className="text-muted-foreground">No data to display</div>;

  if (isExportMode) {
    return (
      <PdfExportHandler
        data={data}
        dataActivity={dataGetActivityLog ?? []}
        dataTa4g={dataGetTa4g ?? []}
        dataGetSqacFirstTier={dataGetSqacFirstTier ?? []}
        dataGetTa4GTier={dataGetTa4GTier ?? []}
        wid={wid}
        baseUrl={baseUrl}
      />
    );
  }

  return (
    <div className="flex h-150 flex-col">
      <ClearAlarmPdfViewerComponent
        data={data}
        dataActivity={dataGetActivityLog ?? []}
        dataTa4g={dataGetTa4g ?? []}
        dataGetSqacFirstTier={dataGetSqacFirstTier ?? []}
        dataGetTa4GTier={dataGetTa4GTier ?? []}
        wid={wid}
        baseUrl={baseUrl}
      />
    </div>
  );
}

export default function TabPdfViewerClearAlarm({ wid }: { wid: string }) {
  const searchParams = useSearchParams();
  const isExportMode = searchParams.get("mode") === "export";

  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
      <TabPdfViewerClearAlarmInner wid={wid} isExportMode={isExportMode} />
    </Suspense>
  );
}

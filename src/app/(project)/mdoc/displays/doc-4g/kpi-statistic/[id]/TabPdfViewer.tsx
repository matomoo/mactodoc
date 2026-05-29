"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";

import type { SqacTrackerItem } from "@/app/(project)/mdoc/def/interfaces";

import SqacPdfDocument from "./SqacPdfDocument";

function PdfViewerComponent({ data, wid }: { data: SqacTrackerItem[]; wid: string }) {
  return (
    <PDFViewer width="100%" height={600} style={{ border: "none" }}>
      <SqacPdfDocument data={data} wid={wid} />
    </PDFViewer>
  );
}

export default function TabPdfViewer({ wid }: { wid: string }) {
  const { data, isPending, error } = useQuery<SqacTrackerItem[]>({
    queryKey: ["sqac-tracker", wid],
    queryFn: async () => {
      const response = await fetch(`/mdoc/api/v1/sqac-tracker?wid=${encodeURIComponent(wid)}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      return response.json();
    },
    enabled: !!wid,
  });

  if (isPending) return <div className="text-muted-foreground">Loading PDF...</div>;
  if (error) return <div className="text-destructive">Error: {error.message}</div>;
  if (!data || data.length === 0) return <div className="text-muted-foreground">No data to display</div>;

  return (
    <div className="flex h-150 flex-col">
      <PdfViewerComponent data={data} wid={wid} />
    </div>
  );
}

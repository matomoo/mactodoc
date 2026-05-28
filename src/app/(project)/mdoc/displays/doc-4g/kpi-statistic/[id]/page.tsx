"use client";

import { use } from "react";

import { pdf } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import { saveAs } from "file-saver";

import type { SqacTrackerItem } from "@/app/(project)/mdoc/def/interfaces";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import SqacPdfDocument from "./SqacPdfDocument";
import TabKpiStatisticPage from "./TabKpiStatistic";
import TabPdfViewer from "./TabPdfViewer";

// import TabPdfViewer from "./TabPdfViewer"; // TODO: uncomment when PDF viewer is needed

function _formatDate(dateStr: string | null) {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function _formatValue(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") return "---";
  return value;
}

export default function KpiStatisticPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: wid } = use(params);

  const { data, isPending, error } = useQuery<SqacTrackerItem[]>({
    queryKey: ["sqac-tracker", wid],
    queryFn: async () => {
      const response = await fetch(`/mdoc/api/v1/sqac-tracker?wid=${encodeURIComponent(wid)}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      return response.json();
    },
    enabled: !!wid,
  });

  const _handleExportPdf = async () => {
    if (!data || data.length === 0) return;
    const blob = await pdf(<SqacPdfDocument data={data} wid={wid} />).toBlob();
    saveAs(blob, `SQAC-${wid}.pdf`);
  };

  return (
    <div className="space-y-4 p-6">
      <Tabs defaultValue="doc_checker" className="w-full">
        <TabsList>
          <TabsTrigger value="doc_checker">Doc Checker</TabsTrigger>
          <TabsTrigger value="kpi_statictic">KPI Statistic</TabsTrigger>
          <TabsTrigger value="pdf_viewer">PDF Viewer</TabsTrigger>
        </TabsList>
        <TabsContent value="doc_checker">
          <Card>
            <CardHeader>
              <CardTitle>Doc Checker</CardTitle>
              <CardDescription>---</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">---</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="kpi_statictic">
          <TabKpiStatisticPage wid={wid} />
        </TabsContent>
        <TabsContent value="pdf_viewer">
          <TabPdfViewer wid={wid} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

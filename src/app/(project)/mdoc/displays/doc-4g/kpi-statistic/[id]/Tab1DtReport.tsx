"use client";

// biome-ignore assist/source/organizeImports: <none>
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import TabDtReportPage from "./TabDtReport";
import TabPdfViewerDtReport from "./TabPdfViewerDtReport";
function _formatDate(dateStr: string | null) {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function _formatValue(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") return "---";
  return value;
}

export default function Tab1DtReportPage({ wid }: { wid: string }) {
  //   const { id: wid } = use(params);

  return (
    <div className="space-y-4 p-2">
      <Tabs defaultValue="kpi_statistic" className="w-full">
        <TabsList>
          <TabsTrigger value="kpi_statistic">DT Report</TabsTrigger>
          <TabsTrigger value="pdf_viewer">View PDF</TabsTrigger>
        </TabsList>
        <TabsContent value="kpi_statistic">
          <TabDtReportPage wid={wid} />
        </TabsContent>
        <TabsContent value="pdf_viewer">
          <TabPdfViewerDtReport wid={wid} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

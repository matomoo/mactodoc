"use client";

// biome-ignore assist/source/organizeImports: <none>
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import TabKpiStatisticPage from "./TabKpiStatistic";
import TabPdfViewerKpiStatistic from "./TabPdfViewerKpiStatistic";
function _formatDate(dateStr: string | null) {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function _formatValue(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") return "---";
  return value;
}

export default function Tab1KpiStatisticPage({ wid }: { wid: string }) {
  //   const { id: wid } = use(params);

  return (
    <div className="space-y-4 p-2">
      <Tabs defaultValue="kpi_statistic" className="w-full">
        <TabsList>
          <TabsTrigger value="kpi_statistic">KPI Statistic</TabsTrigger>
          <TabsTrigger value="pdf_viewer">View PDF</TabsTrigger>
        </TabsList>
        <TabsContent value="kpi_statistic">
          <TabKpiStatisticPage wid={wid} />
        </TabsContent>
        <TabsContent value="pdf_viewer">
          <TabPdfViewerKpiStatistic wid={wid} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

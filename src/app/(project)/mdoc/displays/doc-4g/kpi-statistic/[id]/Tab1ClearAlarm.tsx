"use client";

// biome-ignore assist/source/organizeImports: <none>
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import TabKpiStatisticPage from "./TabKpiStatistic";
import TabPdfViewerKpiStatistic from "./TabPdfViewerKpiStatistic";
import TabClearAlarmPage from "./TabClearAlarm";
import TabPdfViewerClearAlarm from "./TabPdfViewerClearAlarm";
function _formatDate(dateStr: string | null) {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function _formatValue(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") return "---";
  return value;
}

export default function Tab1ClearAlarmPage({ wid }: { wid: string }) {
  //   const { id: wid } = use(params);

  return (
    <div className="space-y-4 p-2">
      <Tabs defaultValue="clear_alarm" className="w-full">
        <TabsList>
          <TabsTrigger value="clear_alarm">Clear Alarm</TabsTrigger>
          <TabsTrigger value="pdf_viewer">View PDF</TabsTrigger>
        </TabsList>
        <TabsContent value="clear_alarm">
          <TabClearAlarmPage wid={wid} />
        </TabsContent>
        <TabsContent value="pdf_viewer">
          <TabPdfViewerClearAlarm wid={wid} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { use } from "react";

import { DateRangeFilter } from "@/components/date-range-filter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import SqacFirstTierPage from "../../../sqac-first-tier/page";
import Tab1ClearAlarmPage from "./Tab1ClearAlarm";
import Tab1KpiStatisticPage from "./Tab1KpiStatistic";
import Tab1Upload from "./Tab1Upload";

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

  return (
    <div className="space-y-4 p-6">
      <DateRangeFilter />
      <Tabs defaultValue="doc_checker" className="w-full">
        <TabsList>
          <TabsTrigger value="doc_checker">Doc Checker</TabsTrigger>
          <TabsTrigger value="kpi_statictic">KPI Statistic</TabsTrigger>
          <TabsTrigger value="clear-alarm">Clear Alarm</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="manage-1st-tier">Manage 1st Tier</TabsTrigger>
          <TabsTrigger value="manage-activity-log">Manage Activity Log</TabsTrigger>
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
          <Tab1KpiStatisticPage wid={wid} />
        </TabsContent>
        <TabsContent value="clear-alarm">
          <Tab1ClearAlarmPage wid={wid} />
        </TabsContent>
        <TabsContent value="upload">
          <Tab1Upload wid={wid} />
        </TabsContent>
        <TabsContent value="manage-1st-tier">
          <SqacFirstTierPage wid={wid} />
        </TabsContent>
        <TabsContent value="manage-activity-log">
          <SqacFirstTierPage wid={wid} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

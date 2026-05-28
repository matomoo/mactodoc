"use client";

import { pdf } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import { saveAs } from "file-saver";

import type { SqacTrackerItem } from "@/app/(project)/mdoc/def/interfaces";
import { NoDataState } from "@/app/(project)/tinfra/_component/ui-v4/additional-component";
import { Button } from "@/components/ui/button";

import SqacPdfDocument from "./SqacPdfDocument";

function _formatDate(dateStr: string | null) {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function _formatValue(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") return "---";
  return value;
}

export default function TabKpiStatisticPage({ wid }: { wid: string }) {
  const { data, isPending, error } = useQuery<SqacTrackerItem[]>({
    queryKey: ["sqac-tracker", wid],
    queryFn: async () => {
      const response = await fetch(`/mdoc/api/v1/sqac-tracker?wid=${encodeURIComponent(wid)}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      return response.json();
    },
    enabled: !!wid,
  });

  const handleExportPdf = async () => {
    if (!data || data.length === 0) return;
    const blob = await pdf(<SqacPdfDocument data={data} wid={wid} />).toBlob();
    saveAs(blob, `SQAC-${wid}.pdf`);
  };

  return (
    <div className="mx-auto w-full space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">KPI Statistic</h1>
        <div className="flex gap-2">
          <Button variant="default" onClick={handleExportPdf} disabled={!data || data.length === 0}>
            Export to PDF
          </Button>
        </div>
      </div>

      {isPending && <div className="text-muted-foreground">Loading...</div>}
      {error && <div className="text-destructive">Error: {error.message}</div>}

      {!data || data.length === 0 ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        data.map((item) => (
          <div key={"table-1"}>
            <div className="font-bold text-lg">SITE QUALITY ACCEPTANCE CERTIFICATE</div>
            <div className="mt-2 text-sm">SITEID-PDID: {wid}</div>
            <div className="flex flex-col">
              <div className="flex flex-row">
                <div className="w-37.5 border-t border-r border-b border-l p-1 font-bold">Site ID</div>
                <div className="w-62.5 border-t border-r border-b p-1 text-center">{item.site}</div>
                <div className="w-37.5 border-t border-r border-b p-1 font-bold">Band SOW</div>
                <div className="w-62.5 border-t border-r border-b p-1 text-center">{item.band}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 border-r border-b border-l p-1 font-bold">Site Name</div>
                <div className="w-62.5 border-r border-b p-1 text-center">{"item.site_name"}</div>
                <div className="w-37.5 border-r border-b p-1 font-bold">eNodeB ID</div>
                <div className="w-62.5 border-r border-b p-1 text-center">{"item.enodeb_id"}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 border-r border-b border-l p-1 font-bold">Type Of Work</div>
                <div className="w-62.5 border-r border-b p-1 text-center">{item.type_of_work}</div>
                <div className="w-37.5 border-r border-b p-1 font-bold">TAC</div>
                <div className="w-62.5 border-r border-b p-1 text-center">{item.tac}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 border-r border-b border-l p-1 font-bold">City</div>
                <div className="w-62.5 border-r border-b p-1 text-center">{item.city}</div>
                <div className="w-37.5 border-r border-b p-1 font-bold">Cell ID</div>
                <div className="w-62.5 border-r border-b p-1 text-center">{"item.cell_id"}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 border-r border-b border-l p-1 font-bold">Band Impact</div>
                <div className="w-62.5 border-r border-b p-1 text-center">{item.band_impact}</div>
                <div className="w-37.5 border-r border-b p-1 font-bold">{""}</div>
                <div className="w-62.5 border-r border-b p-1 text-center">{""}</div>
              </div>
            </div>

            <div className="mt-2 flex flex-row">
              <div className="w-37.5 border-t border-r border-b border-l p-1 font-bold">Integration Date</div>
              <div className="w-32 border-t border-r border-b p-1 text-center">{item.connected}</div>
              <div className="w-37.5 border-t border-r border-b p-1 font-bold">{"On Air Date"}</div>
              <div className="w-32 border-t border-r border-b p-1 text-center">{item.connected}</div>
              <div className="w-37.5 border-t border-r border-b p-1 font-bold">{"Acceptance Date"}</div>
              <div className="w-32 border-t border-r border-b p-1 text-center">{item.dt}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

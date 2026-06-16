"use client";

import { useState } from "react";

import { pdf } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import { saveAs } from "file-saver";

import type {
  DataKpiStatistic4g,
  DataPayloadBandSiteSow,
  DataPayloadThpUser,
  SqacTrackerItem,
} from "@/app/(project)/mdoc/def/interfaces";
import { formatDayName } from "@/app/(project)/mdoc/utils/parserDate";
import { NoDataState } from "@/app/(project)/tinfra/_component/ui-v4/additional-component";
import { Button } from "@/components/ui/button";

import ChartPayloadBandCellSow from "./ChartPayloadBandCellSow";
import ChartPayloadBandSiteSow from "./ChartPayloadBandSiteSow";
import ChartPayloadThpUser from "./ChartPayloadThpUser";
import ChartRrcUtilization from "./ChartRrcUtilization";
import SqacPdfDocument from "./SqacPdfDocument";

function _formatDate(dateStr: string | null) {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function _formatValue(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") return "---";
  return value;
}

function _formatYn(value: string | number | null | undefined): string {
  if (value === 1 || value === "1") return "Y";
  if (value === 0 || value === "0") return "N";
  return String(value ?? "");
}

export default function TabClearAlarmPage({ wid }: { wid: string }) {
  const [beforeDay1, setBeforeDay1] = useState("2026-05-01");
  const [beforeDay2, setBeforeDay2] = useState("2026-05-02");
  const [beforeDay3, setBeforeDay3] = useState("2026-05-03");
  const [afterDay1, setAfterDay1] = useState("2026-06-01");
  const [afterDay2, setAfterDay2] = useState("2026-06-02");
  const [afterDay3, setAfterDay3] = useState("2026-06-03");

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
  } = useQuery<DataKpiStatistic4g[]>({
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

  return (
    <div className="mx-auto w-full space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">KPI Statistic</h1>
        <div className="flex gap-2">
          <Button
            variant="default"
            // onClick={handleExportPdf}
            disabled={!dataSqacTracker || dataSqacTracker.length === 0}
          >
            Export to PDF
          </Button>
        </div>
      </div>

      {/* Table Information 4G */}
      {isPendingSqacTracker && <div className="text-muted-foreground">Loading...</div>}
      {errorSqacTracker && <div className="text-destructive">Error: {errorSqacTracker.message}</div>}

      {!dataSqacTracker || dataSqacTracker.length === 0 ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        dataSqacTracker.map((item) => (
          <div key={"table-1"}>
            <div className="font-bold text-lg">ACTIVITY LOG INFORMATION</div>
            <div className="flex flex-col">
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-t border-r border-b border-l p-1 font-bold">Site ID</div>
                <div className="w-82.5 shrink-0 border-t border-r border-b p-1 text-center">{item.siteid}</div>
                <div className="w-37.5 shrink-0 border-t border-r border-b p-1 font-bold">Band SOW</div>
                <div className="w-42.5 shrink-0 border-t border-r border-b p-1 text-center">
                  {item.band_4g_sow}-{item.band_2g_sow}
                </div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">eNodeB Name</div>
                <div className="w-82.5 shrink-0 border-r border-b p-1 text-center">{item.site_name_4g}</div>
                <div className="w-37.5 shrink-0 border-r border-b p-1 font-bold">eNodeB ID</div>
                <div className="w-42.5 shrink-0 border-r border-b p-1 text-center">{item.enodeb_id}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">TAC</div>
                <div className="w-82.5 shrink-0 border-r border-b p-1 text-center">{item.tac}</div>
                <div className="w-37.5 shrink-0 border-r border-b p-1 font-bold">CI</div>
                <div className="w-42.5 shrink-0 border-r border-b p-1 text-center">{item.cell_id_4g}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">TRX Configuration</div>
                <div className="w-82.5 shrink-0 border-r border-b p-1 text-center">{item.trx_configuration}</div>
                <div className="w-37.5 shrink-0 border-r border-b p-1 font-bold">Band Impact</div>
                <div className="w-42.5 shrink-0 border-r border-b p-1 text-center">
                  {item.band_4g_sow}-{item.band_2g_sow}
                </div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">District Cluster</div>
                <div className="w-82.5 shrink-0 border-r border-b p-1 text-center">{item.kabupaten}</div>
                <div className="w-37.5 shrink-0 border-r border-b p-1 font-bold">{"Connected Date"}</div>
                <div className="w-42.5 shrink-0 border-r border-b p-1 text-center">{item.connected}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">Site Longitude</div>
                <div className="w-82.5 shrink-0 border-r border-b p-1 text-center">{item.longitude}</div>
                <div className="w-37.5 shrink-0 border-r border-b p-1 font-bold">Site Latitude</div>
                <div className="w-42.5 shrink-0 border-r border-b p-1 text-center">{item.latitude}</div>
              </div>
              <div className="flex flex-row">
                <div className="w-37.5 shrink-0 border-r border-b border-l p-1 font-bold">Type Work TI</div>
                <div className="w-162.5 shrink-0 border-r border-b p-1 text-center">{item.type_of_work}</div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Table Information 4G */}
      {isPendingGetActivityLog && <div className="text-muted-foreground">Loading...</div>}
      {errorGetActivityLog && <div className="text-destructive">Error: {errorGetActivityLog.message}</div>}

      {!dataGetActivityLog || dataGetActivityLog.length === 0 || !dataSqacTracker ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        <div className="flex flex-col">
          <div className="flex flex-row">
            <div className="w-10 shrink-0 border-t border-r border-b border-l p-1 text-center">No</div>
            <div className="w-82.5 shrink-0 border-t border-r border-b p-1 text-center">Site Name</div>
            <div className="w-12 shrink-0 border-t border-r border-b p-1 text-center">TAC</div>
            <div className="w-14 shrink-0 border-t border-r border-b p-1 text-center">Site ID</div>
            <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">eNodeB ID</div>
            <div className="w-25 shrink-0 border-t border-r border-b p-1 text-center">Date Requested</div>
            <div className="w-18 shrink-0 border-t border-r border-b p-1 text-center">Problem Detected</div>
            <div className="w-50 shrink-0 border-t border-r border-b p-1 text-center">Action & Recommendation</div>
            <div className="w-25 shrink-0 border-t border-r border-b p-1 text-center">Executed Day</div>
            <div className="w-15 shrink-0 border-t border-r border-b p-1 text-center">Status</div>
          </div>
          {dataGetActivityLog.map((item, index) => (
            <div key={item.tanggal} className="flex flex-row">
              <div className="w-10 shrink-0 border-t border-r border-b border-l p-1 text-center">{index + 1}</div>
              <div className="w-82.5 shrink-0 border-t border-r border-b p-1 text-center">
                {dataSqacTracker[0].site_name_4g}
              </div>
              <div className="w-12 shrink-0 border-t border-r border-b p-1 text-center">{dataSqacTracker[0].tac}</div>
              <div className="w-14 shrink-0 border-t border-r border-b p-1 text-center">
                {dataSqacTracker[0].siteid}
              </div>
              <div className="w-16 shrink-0 border-t border-r border-b p-1 text-center">
                {dataSqacTracker[0].enodeb_id}
              </div>
              <div className="w-25 shrink-0 border-t border-r border-b p-1 text-center">
                {item.tanggal.slice(0, 10)}
              </div>
              <div className="w-18 shrink-0 border-t border-r border-b p-1 text-center">{""}</div>
              <div className="w-50 shrink-0 border-t border-r border-b p-1 text-center">{item.deskripsi}</div>
              <div className="w-25 shrink-0 border-t border-r border-b p-1 text-center">
                {item.tanggal.slice(0, 10)}
              </div>
              <div className="w-15 shrink-0 border-t border-r border-b p-1 text-center">{""}</div>
            </div>
          ))}
        </div>
      )}
      {/* eof */}
    </div>
  );
}

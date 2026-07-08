"use client";

import { useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { toJpeg } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { DataKpiStatistic4g, SqacTrackerItem, TaDataItem } from "@/app/(project)/mdoc/def/interfaces";
import { NoDataState } from "@/app/(project)/tinfra/_component/ui-v4/additional-component";
import { Button } from "@/components/ui/button";

import type { ChartKpi4gRef } from "./ChartKpi4g";
import ChartKpi4g from "./ChartKpi4g";
import type { ChartTa4gRef } from "./ChartTa4g";
import ChartTa4g from "./ChartTa4g";

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
  const [isExporting, setIsExporting] = useState(false);

  // Refs for chart components
  const chartKpi4gAvailabilityRef = useRef<ChartKpi4gRef>(null);
  const chartKpi4gRrcSetupRef = useRef<ChartKpi4gRef>(null);
  const chartKpi4gErabSetupRef = useRef<ChartKpi4gRef>(null);
  const chartKpi4gCssrRef = useRef<ChartKpi4gRef>(null);
  const chartKpi4gErabDropRef = useRef<ChartKpi4gRef>(null);
  const chartKpi4gIfhoRef = useRef<ChartKpi4gRef>(null);
  const chartKpi4gCsfbRef = useRef<ChartKpi4gRef>(null);
  const chartKpi4gCqiAverageRef = useRef<ChartKpi4gRef>(null);
  const chartKpi4gSe2Ref = useRef<ChartKpi4gRef>(null);
  const chartKpi4gNumberCsfbRef = useRef<ChartKpi4gRef>(null);
  const chartKpi4gPayloadCaRef = useRef<ChartKpi4gRef>(null);
  const chartKpi2gAvailabilityRef = useRef<ChartKpi4gRef>(null);
  const chartKpi2gSdsrRef = useRef<ChartKpi4gRef>(null);
  const chartKpi2gHosrRef = useRef<ChartKpi4gRef>(null);
  const chartKpi2gDcrRef = useRef<ChartKpi4gRef>(null);
  const chartKpi2gTbfDlRef = useRef<ChartKpi4gRef>(null);
  const chartKpi2gTbfCompRef = useRef<ChartKpi4gRef>(null);
  const chartKpi2gFastReturnLteRef = useRef<ChartKpi4gRef>(null);
  const chartTa4gBandSowRefs = useRef<Map<string, ChartTa4gRef>>(new Map());
  const chartTa4gBandNotSowRefs = useRef<Map<string, ChartTa4gRef>>(new Map());

  // Refs for table components
  const tableClearAlarmInfo4gRef = useRef<HTMLDivElement>(null);
  const tableActivityLog4gRef = useRef<HTMLDivElement>(null);

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

  const {
    data: dataGetKpi4g,
    isPending: isPendingGetKpi4g,
    error: errorGetKpi4g,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["get-kpi-4g", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/chart-kpi-4g?siteid=${dataSqacTracker?.[0].siteid}&band=${dataSqacTracker?.[0].band_4g_sow}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataGetKpi2g,
    isPending: isPendingGetKpi2g,
    error: errorGetKpi2g,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["get-kpi-2g", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/chart-kpi-2g?siteid=${dataSqacTracker?.[0].siteid}&band=${dataSqacTracker?.[0].band_4g_sow}&city=${dataSqacTracker?.[0].kabupaten}&beforeDay1=${beforeDay1}&afterDay3=${afterDay3}`,
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

  // console.log({ dataGetTa4g });

  const handleExportChartsToServer = async () => {
    setIsExporting(true);

    const chartRefs = [
      // 4G KPI charts
      { ref: chartKpi4gAvailabilityRef, name: "kpi-4g-availability" },
      { ref: chartKpi4gRrcSetupRef, name: "kpi-4g-rrc_setup" },
      { ref: chartKpi4gErabSetupRef, name: "kpi-4g-erab_setup" },
      { ref: chartKpi4gCssrRef, name: "kpi-4g-cssr" },
      { ref: chartKpi4gErabDropRef, name: "kpi-4g-erab_drop" },
      { ref: chartKpi4gIfhoRef, name: "kpi-4g-ifho" },
      { ref: chartKpi4gCsfbRef, name: "kpi-4g-csfb" },
      { ref: chartKpi4gCqiAverageRef, name: "kpi-4g-cqi_average" },
      { ref: chartKpi4gSe2Ref, name: "kpi-4g-se2" },
      { ref: chartKpi4gNumberCsfbRef, name: "kpi-4g-number_csfb" },
      { ref: chartKpi4gPayloadCaRef, name: "kpi-4g-payload_ca" },
      // 2G KPI charts
      { ref: chartKpi2gAvailabilityRef, name: "kpi-2g-availability" },
      { ref: chartKpi2gSdsrRef, name: "kpi-2g-sdsr" },
      { ref: chartKpi2gHosrRef, name: "kpi-2g-hosr" },
      { ref: chartKpi2gDcrRef, name: "kpi-2g-dcr" },
      { ref: chartKpi2gTbfDlRef, name: "kpi-2g-tbf_dl" },
      { ref: chartKpi2gTbfCompRef, name: "kpi-2g-tbf_comp" },
      { ref: chartKpi2gFastReturnLteRef, name: "kpi-2g-fast_return_lte" },
    ];

    try {
      // Export KPI charts
      for (const { ref, name } of chartRefs) {
        if (ref.current) {
          const imageData = ref.current.getImageData();
          if (imageData) {
            const filename = `${wid}-chart-${name}.jpg`;
            const response = await fetch("/mdoc/api/v1/chart-export", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageData, filename }),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || "Failed to save chart");
            }
          }
        }
      }

      // Export TA 4G Band SOW charts
      for (const [key, chartRef] of chartTa4gBandSowRefs.current.entries()) {
        const imageData = chartRef.getImageData();
        if (imageData) {
          const filename = `${wid}-chart-ta-4g-band-sow-${key}.jpg`;
          const response = await fetch("/mdoc/api/v1/chart-export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData, filename }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to save chart");
          }
        }
      }

      // Export TA 4G Band Not SOW charts
      for (const [key, chartRef] of chartTa4gBandNotSowRefs.current.entries()) {
        const imageData = chartRef.getImageData();
        if (imageData) {
          const filename = `${wid}-chart-ta-4g-band-not-sow-${key}.jpg`;
          const response = await fetch("/mdoc/api/v1/chart-export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData, filename }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to save chart");
          }
        }
      }

      // Export Table Clear Alarm Info 4G
      if (tableClearAlarmInfo4gRef.current) {
        try {
          const imageData = await toJpeg(tableClearAlarmInfo4gRef.current, {
            quality: 1.0,
            backgroundColor: "#ffffff",
          });
          const filename = `${wid}-table-clear-alarm-info-4g.jpg`;
          const response = await fetch("/mdoc/api/v1/chart-export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData, filename }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to save table");
          }
        } catch (err) {
          console.error("Table export failed:", err);
        }
      }

      // Export Table Activity Log 4G
      if (tableActivityLog4gRef.current) {
        try {
          const imageData = await toJpeg(tableActivityLog4gRef.current, {
            quality: 1.0,
            backgroundColor: "#ffffff",
          });
          const filename = `${wid}-table-activity-log-4g.jpg`;
          const response = await fetch("/mdoc/api/v1/chart-export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageData, filename }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to save table");
          }
        } catch (err) {
          console.error("Table export failed:", err);
        }
      }

      toast.success("Charts exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to export charts");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mx-auto w-full space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">Clear Alarm</h1>
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={handleExportChartsToServer}
            disabled={isExporting || !dataSqacTracker || dataSqacTracker.length === 0}
          >
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export Charts
          </Button>
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
        dataSqacTracker.map((item, index) => (
          <div
            key={"table-clear-alarm-info-4g"}
            ref={index === 0 ? tableClearAlarmInfo4gRef : undefined}
            className="p-1"
          >
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

      {/* Table activity log 4G */}
      {isPendingGetActivityLog && <div className="text-muted-foreground">Loading...</div>}
      {errorGetActivityLog && <div className="text-destructive">Error: {errorGetActivityLog.message}</div>}

      {!dataGetActivityLog || dataGetActivityLog.length === 0 || !dataSqacTracker ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        <div key={"table-activity-log-4g"} ref={tableActivityLog4gRef} className="flex flex-col p-1">
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

      {/* Chart Payload Cell Per Sector*/}
      {isPendingGetKpi4g && <div className="text-muted-foreground">Loading...</div>}
      {errorGetKpi4g && <div className="text-destructive">Error: {errorGetKpi4g.message}</div>}

      {dataGetKpi4g && dataGetKpi4g.length > 0 && dataGetActivityLog && dataGetActivityLog.length > 0 && (
        <div key={"chart-kpi-4g"} className="mt-16">
          <div>
            <ChartKpi4g
              ref={chartKpi4gAvailabilityRef}
              data={dataGetKpi4g}
              kpi_by={"availability"}
              chart_title={"Availability (%)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi4gRrcSetupRef}
              data={dataGetKpi4g}
              kpi_by={"rrc_setup"}
              chart_title={"RRC Setup SR (%)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi4gErabSetupRef}
              data={dataGetKpi4g}
              kpi_by={"erab_setup"}
              chart_title={"E-RAB Success Rate (%)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi4gCssrRef}
              data={dataGetKpi4g}
              kpi_by={"cssr"}
              chart_title={"Call Setup Success Rate (%)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi4gErabDropRef}
              data={dataGetKpi4g}
              kpi_by={"erab_drop"}
              chart_title={"E-RAB Drop Rate (%)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi4gIfhoRef}
              data={dataGetKpi4g}
              kpi_by={"ifho"}
              chart_title={"Success Rate of Intra RAT- Intra Freq Cell Outgoing Handover (%)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi4gCsfbRef}
              data={dataGetKpi4g}
              kpi_by={"csfb"}
              chart_title={"CSFB Preparation Success Rate (%)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi4gCqiAverageRef}
              data={dataGetKpi4g}
              kpi_by={"cqi_average"}
              chart_title={"CQI Average"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi4gSe2Ref}
              data={dataGetKpi4g}
              kpi_by={"se2"}
              chart_title={"Spectral Efficiency 2"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi4gNumberCsfbRef}
              data={dataGetKpi4g}
              kpi_by={"number_csfb"}
              chart_title={"Number of Redirection Requests from LTE to GSM(CSFB)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi4gPayloadCaRef}
              data={dataGetKpi4g}
              kpi_by={"payload_ca"}
              chart_title={"Total Payload CA (Mbyte)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
        </div>
      )}

      {/* Chart Kpi 2g*/}
      {isPendingGetKpi2g && <div className="text-muted-foreground">Loading...</div>}
      {errorGetKpi2g && <div className="text-destructive">Error: {errorGetKpi2g.message}</div>}

      {dataGetKpi2g && dataGetKpi2g.length > 0 && dataGetActivityLog && dataGetActivityLog.length > 0 && (
        <div key={"chart-kpi-2g"} className="mt-16">
          <div>
            <ChartKpi4g
              ref={chartKpi2gAvailabilityRef}
              data={dataGetKpi2g}
              kpi_by={"availability"}
              chart_title={"Availability (%)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi2gSdsrRef}
              data={dataGetKpi2g}
              kpi_by={"sdsr"}
              chart_title={"SDSR (%)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi2gHosrRef}
              data={dataGetKpi2g}
              kpi_by={"hosr"}
              chart_title={"HOSR (%)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi2gDcrRef}
              data={dataGetKpi2g}
              kpi_by={"dcr"}
              chart_title={"DCR (%)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi2gTbfDlRef}
              data={dataGetKpi2g}
              kpi_by={"tbf_dl"}
              chart_title={"TBF DL EST SR (%)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi2gTbfCompRef}
              data={dataGetKpi2g}
              kpi_by={"tbf_comp"}
              chart_title={"TBF Completion SR (%)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
          <div>
            <ChartKpi4g
              ref={chartKpi2gFastReturnLteRef}
              data={dataGetKpi2g}
              kpi_by={"fast_return_lte"}
              chart_title={"Number of fastreturn to LTE (2G)"}
              dataActivityLog={dataGetActivityLog}
            />
          </div>
        </div>
      )}

      {/* Chart TA 4g*/}
      {isPendingGetTa4g && <div className="text-muted-foreground">Loading...</div>}
      {errorGetTa4g && <div className="text-destructive">Error: {errorGetTa4g.message}</div>}

      {dataGetTa4g && dataGetTa4g.length > 0 && dataGetActivityLog && dataGetActivityLog.length > 0 && (
        <div key={"chart-ta-4g-band-sow"} className="mt-16">
          {[
            ...new Set(
              dataGetTa4g.filter((d) => d.band === dataSqacTracker?.[0].band_4g_sow).map((item) => item.cellId),
            ),
          ].map((cellId) => {
            const item = dataGetTa4g.find((d) => d.cellId === cellId && d.band === dataSqacTracker?.[0].band_4g_sow);
            const refKey = `band-${dataSqacTracker?.[0].band_4g_sow?.toLowerCase()}-cellid-${cellId}`;
            return (
              <div key={cellId} className="mb-8">
                <div>{item?.siteid_short_band_sector ?? `Cell ${cellId}`}</div>
                <ChartTa4g
                  ref={(ref) => {
                    if (ref) {
                      chartTa4gBandSowRefs.current.set(refKey, ref);
                    } else {
                      chartTa4gBandSowRefs.current.delete(refKey);
                    }
                  }}
                  data={dataGetTa4g}
                  siteid={item?.siteid ?? ""}
                  band={dataSqacTracker?.[0].band_4g_sow ?? ""}
                  cellId={cellId}
                />
              </div>
            );
          })}
        </div>
      )}

      {dataGetTa4g && dataGetTa4g.length > 0 && dataGetActivityLog && dataGetActivityLog.length > 0 && (
        <div key={"chart-ta-4g-band-not-sow"} className="mt-16">
          {[...new Set(dataGetTa4g.filter((d) => d.band !== dataSqacTracker?.[0].band_4g_sow).map((item) => item.band))]
            .sort()
            .map((band) => (
              <div key={band} className="mb-8">
                <div className="font-bold text-lg mb-4">{band}</div>
                {[...new Set(dataGetTa4g.filter((d) => d.band === band).map((item) => item.cellId))]
                  .sort()
                  .map((cellId) => {
                    const item = dataGetTa4g.find((d) => d.cellId === cellId && d.band === band);
                    const refKey = `band-${band.toLowerCase()}-cellid-${cellId}`;
                    return (
                      <div key={cellId} className="mb-4">
                        <div>{item?.siteid_short_band_sector ?? `Cell ${cellId}`}</div>
                        <ChartTa4g
                          ref={(ref) => {
                            if (ref) {
                              chartTa4gBandNotSowRefs.current.set(refKey, ref);
                            } else {
                              chartTa4gBandNotSowRefs.current.delete(refKey);
                            }
                          }}
                          data={dataGetTa4g}
                          siteid={item?.siteid ?? ""}
                          band={band}
                          cellId={cellId}
                        />
                      </div>
                    );
                  })}
              </div>
            ))}
        </div>
      )}

      {/* eof */}
    </div>
  );
}

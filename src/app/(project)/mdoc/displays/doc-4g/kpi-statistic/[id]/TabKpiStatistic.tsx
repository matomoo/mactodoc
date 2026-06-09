"use client";

import { pdf } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import { saveAs } from "file-saver";

import type { DataKpiStatistic4g, SqacTrackerItem } from "@/app/(project)/mdoc/def/interfaces";
import { formatDayName } from "@/app/(project)/mdoc/utils/parserDate";
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

function _formatYn(value: string | number | null | undefined): string {
  if (value === 1 || value === "1") return "Y";
  if (value === 0 || value === "0") return "N";
  return String(value ?? "");
}

export default function TabKpiStatisticPage({ wid }: { wid: string }) {
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
    data: dataTargetKpiStatistic4g,
    isPending: isPendingTargetKpiStatistic4g,
    error: errorTargetKpiStatistic4g,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["target-kpi-statistic-4g", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/target-kpi-statistic-4g?siteid=${dataSqacTracker?.[0].site}&band=${dataSqacTracker?.[0].band}&city=${dataSqacTracker?.[0].city}&day1=2026-06-01&day2=2026-06-02&day3=2026-06-03`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  // console.log("dataTargetKpiStatistic4g", dataTargetKpiStatistic4g);

  const {
    data: dataKpiStatistic4g,
    isPending: isPendingKpiStatistic4g,
    error: errorKpiStatistic4g,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["kpi-statistic-4g", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/kpi-statistic-4g?siteid=${dataSqacTracker?.[0].site}&band=${dataSqacTracker?.[0].band}&city=${dataSqacTracker?.[0].city}&day1=2026-06-01&day2=2026-06-02&day3=2026-06-03`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  const {
    data: dataTargetKpiStatistic2g,
    isPending: isPendingTargetKpiStatistic2g,
    error: errorTargetKpiStatistic2g,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["target-kpi-statistic-2g", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/target-kpi-statistic-2g?siteid=${dataSqacTracker?.[0].site}&band=${dataSqacTracker?.[0].band === "L900" ? "GSM900" : "DCS1800"}&city=${dataSqacTracker?.[0].city}&day1=2026-06-01&day2=2026-06-02&day3=2026-06-03`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  // console.log({ dataTargetKpiStatistic2g });

  const {
    data: dataKpiStatistic2g,
    isPending: isPendingKpiStatistic2g,
    error: errorKpiStatistic2g,
  } = useQuery<DataKpiStatistic4g[]>({
    queryKey: ["kpi-statistic-2g", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/kpi-statistic-2g?siteid=${dataSqacTracker?.[0].site}&band=${dataSqacTracker?.[0].band === "L900" ? "GSM900" : "DCS1800"}&city=${dataSqacTracker?.[0].city}&day1=2026-06-01&day2=2026-06-02&day3=2026-06-03`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      return result.rows;
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  console.log({ dataKpiStatistic2g });

  const handleExportPdf = async () => {
    if (!dataSqacTracker || dataSqacTracker.length === 0) return;
    const blob = await pdf(<SqacPdfDocument data={dataSqacTracker} wid={wid} />).toBlob();
    saveAs(blob, `SQAC-${wid}.pdf`);
  };

  return (
    <div className="mx-auto w-full space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">KPI Statistic</h1>
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={handleExportPdf}
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

      {/* Target KPI Statistic 4G */}
      {isPendingTargetKpiStatistic4g && <div className="text-muted-foreground">Loading...</div>}
      {errorTargetKpiStatistic4g && <div className="text-destructive">Error: {errorTargetKpiStatistic4g.message}</div>}

      {!dataTargetKpiStatistic4g || dataTargetKpiStatistic4g.length === 0 ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        <div key={"table-target-kpi-4g"}>
          <div className="flex flex-row">
            <div className="w-20.5 border-t border-r border-b border-l p-1">City</div>
            <div className="w-20.5 border-t border-r border-b border-l p-1">Band</div>
            <div className="flex flex-col">
              <div className="flex flex-row">
                <div className="flex flex-col">
                  <div className="flex flex-row">
                    <div className="w-205 border-t border-r border-b p-1 text-center">Cluster Value Summary</div>
                  </div>
                  <div className="flex flex-row">
                    <div className="w-20.5 text-wrap border-t border-r border-b p-1 text-center">
                      RRC Est Success Rate (%)
                    </div>
                    <div className="w-20.5 border-t border-r border-b p-1 text-center">E-RAB Success Rate (%)</div>
                    <div className="w-20.5 border-t border-r border-b p-1 text-center">Call Setup Success Rate (%)</div>
                    <div className="w-20.5 border-t border-r border-b p-1 text-center">E-RAB Drop Rate (%)</div>
                    <div className="w-20.5 border-t border-r border-b p-1 text-center">Intra Freq LTE HO (%)</div>
                    <div className="w-20.5 border-t border-r border-b p-1 text-center">Inter Freq LTE HO (%)</div>
                    <div className="w-20.5 border-t border-r border-b p-1 text-center">CSFB (%)</div>
                    <div className="w-20.5 border-t border-r border-b p-1 text-center">CQI Average</div>
                    <div className="w-20.5 border-t border-r border-b p-1 text-center">SE2</div>
                    <div className="w-20.5 border-t border-r border-b p-1 text-center">Uplink RSSI (dBm)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="w-20.5 text-wrap border-t border-r border-b border-l p-1 text-center">LUWU</div>
            <div className="w-20.5 text-wrap border-t border-r border-b p-1 text-center">L900</div>
            <div className="w-20.5 text-wrap border-t border-r border-b border-l p-1 text-center">
              {dataTargetKpiStatistic4g[0]["RRC Est Success Rate (%)"] || ""}
            </div>
            <div className="w-20.5 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["E-RAB Success Rate (%)"] || ""}
            </div>
            <div className="w-20.5 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["Call Setup Success Rate (%)"] || ""}
            </div>
            <div className="w-20.5 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["E-RAB Drop Rate (%)"] || ""}
            </div>
            <div className="w-20.5 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["Intra Freq LTE HO (%)"] || ""}
            </div>
            <div className="w-20.5 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["Inter Freq LTE HO (%)"] || "95.00"}
            </div>
            <div className="w-20.5 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["CSFB (%)"] || ""}
            </div>
            <div className="w-20.5 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["CQI Average"] || ""}
            </div>
            <div className="w-20.5 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0].SE2 || ""}
            </div>
            <div className="w-20.5 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic4g[0]["Uplink RSSI (dBm)"] || ""}
            </div>
          </div>
        </div>
      )}

      {/* Table KPI Statistic 4G */}
      {isPendingKpiStatistic4g && <div className="text-muted-foreground">Loading...</div>}
      {errorKpiStatistic4g && <div className="text-destructive">Error: {errorKpiStatistic4g.message}</div>}

      {!dataKpiStatistic4g || dataKpiStatistic4g.length === 0 ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        <div key={"table-1"}>
          <div className="font-bold text-lg">1. Statistical Quality</div>
          <div className="mt-2 text-sm">1.1 NE Level Performance</div>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <div className="w-65.5 border-t border-r border-b border-l p-1 font-bold">KPI</div>
              <div className="flex flex-col">
                <div className="w-143.5 border-t border-r border-b p-1 text-center">Site Name</div>
                <div className="flex flex-row">
                  <div className="flex flex-col">
                    <div className="flex flex-row">
                      <div className="w-20.5 border-t border-r border-b p-1 text-center">Day-1</div>
                      <div className="w-20.5 border-t border-r border-b p-1 text-center">Day-2</div>
                      <div className="w-20.5 border-t border-r border-b p-1 text-center">Day-3</div>
                    </div>
                    <div className="flex flex-row">
                      <div className="w-20.5 border-t border-r border-b p-1 text-center">Tanggal-1</div>
                      <div className="w-20.5 border-t border-r border-b p-1 text-center">Tanggal-2</div>
                      <div className="w-20.5 border-t border-r border-b p-1 text-center">Tanggal-3</div>
                    </div>
                  </div>
                  <div className="w-20.5 border-t border-r border-b p-1 text-center">Average</div>
                  <div className="w-20.5 border-t border-r border-b p-1 text-center">Target</div>
                  <div className="w-20.5 text-wrap border-t border-r border-b p-1 text-center">Impro vement</div>
                  <div className="w-20.5 border-t border-r border-b p-1 text-center">Result</div>
                </div>
              </div>
            </div>
            {dataKpiStatistic4g.map((item) => (
              <div key={item.kpi_index} className="flex flex-row">
                <div className="w-65.5 border-t border-r border-b border-l p-1 font-bold">{item.kpi_name}</div>
                <div className="w-20.5 border-t border-r border-b p-1 text-center">{item.day1_val}</div>
                <div className="w-20.5 border-t border-r border-b p-1 text-center">{item.day2_val}</div>
                <div className="w-20.5 border-t border-r border-b p-1 text-center">{item.day3_val}</div>
                <div className="w-20.5 border-t border-r border-b p-1 text-center">{item.average}</div>
                <div className="w-20.5 border-t border-r border-b p-1 text-center">{item.target}</div>
                <div className="w-20.5 border-t border-r border-b p-1 text-center">{item.delta}</div>
                <div className="w-20.5 border-t border-r border-b p-1 text-center">{item.remark}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Target KPI Statistic 2G */}
      {isPendingTargetKpiStatistic2g && <div className="text-muted-foreground">Loading...</div>}
      {errorTargetKpiStatistic2g && <div className="text-destructive">Error: {errorTargetKpiStatistic2g.message}</div>}

      {!dataTargetKpiStatistic2g || dataTargetKpiStatistic2g.length === 0 ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        <div key={"table-target-kpi-2g"}>
          <div className="flex flex-row">
            <div className="w-20.5 border-t border-r border-b border-l p-1">City</div>
            <div className="w-20.5 border-t border-r border-b border-l p-1">Band</div>
            <div className="flex flex-col">
              <div className="flex flex-row">
                <div className="flex flex-col">
                  <div className="border-t border-r border-b p-1 text-center">KPI ACCEPTANCE (ACCEPTANCE VALUE)</div>
                  <div className="flex flex-row">
                    <div className="w-20.5 border-t border-r border-b p-1 text-center">SDSR (%)</div>
                    <div className="w-20.5 border-t border-r border-b p-1 text-center">HOSR (%)</div>
                    <div className="w-20.5 border-t border-r border-b p-1 text-center">DCR (%)</div>
                    <div className="w-20.5 border-t border-r border-b p-1 text-center">TBF DL EST SR (%)</div>
                    <div className="wrap-break-word w-20.5 border-t border-r border-b p-1 text-center">
                      TBF COMPLETION SR (%)
                    </div>
                    <div className="w-20.5 border-t border-r border-b p-1 text-center">ICM BAND (0-5)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="w-20.5 text-wrap border-t border-r border-b border-l p-1 text-center">LUWU</div>
            <div className="w-20.5 text-wrap border-t border-r border-b p-1 text-center">L900</div>
            <div className="w-20.5 text-wrap border-t border-r border-b border-l p-1 text-center">
              {dataTargetKpiStatistic2g[0]["SDSR (%)"] || ""}
            </div>
            <div className="w-20.5 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic2g[0]["HOSR (%)"] || ""}
            </div>
            <div className="w-20.5 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic2g[0]["DCR (%)"] || ""}
            </div>
            <div className="w-20.5 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic2g[0]["TBF DL EST SR (%)"] || ""}
            </div>
            <div className="w-20.5 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic2g[0]["TBF COMPLETION SR (%)"] || ""}
            </div>
            <div className="w-20.5 border-t border-r border-b p-1 text-center">
              {dataTargetKpiStatistic2g[0]["ICM BAND (0-5)"] || "95.00"}
            </div>
          </div>
        </div>
      )}

      {/* Table KPI Statistic 2G */}
      {isPendingKpiStatistic2g && <div className="text-muted-foreground">Loading...</div>}
      {errorKpiStatistic2g && <div className="text-destructive">Error: {errorKpiStatistic2g.message}</div>}

      {!dataKpiStatistic2g || dataKpiStatistic2g.length === 0 ? (
        <NoDataState message="No data available for the selected criteria." />
      ) : (
        <div key={"table-kpi-statistic-2g"}>
          <div className="mt-2 text-sm">Site Level Performance</div>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <div className="w-28 border-t border-r border-b border-l p-1">Date</div>
              <div className="w-28 border-t border-r border-b border-l p-1">Calendar Day</div>
              <div className="flex flex-col">
                <div className="border-t border-r border-b p-1 text-center">KPI Parameters</div>
                <div className="flex flex-row">
                  <div className="w-16 border-t border-r border-b p-1 text-center">Site Avail (%)</div>
                  <div className="w-16 border-t border-r border-b p-1 text-center">SDSR (%)</div>
                  <div className="w-16 border-t border-r border-b p-1 text-center">HOSR (%)</div>
                  <div className="w-16 border-t border-r border-b p-1 text-center">TBF UL EST SR (%)</div>
                  <div className="w-16 border-t border-r border-b p-1 text-center">TBF DL EST SR (%)</div>
                  <div className="wrap-break-word w-16 border-t border-r border-b p-1 text-center">
                    TBF COMPLETION SR (%)
                  </div>
                  <div className="wrap-break-word w-16 border-t border-r border-b p-1 text-center">UTILIZATION (%)</div>
                  <div className="w-16 border-t border-r border-b p-1 text-center">BH Traffic (Erl)</div>
                  <div className="w-16 border-t border-r border-b p-1 text-center">Payload (MB)</div>
                  <div className="w-16 border-t border-r border-b p-1 text-center">ICM BAND (0-5)</div>
                </div>
              </div>
            </div>
            {dataKpiStatistic2g.map((item) => (
              <div key={item.sort} className="flex flex-row">
                <div className="w-28 border-t border-r border-b border-l p-1">{item.Date}</div>
                <div className="w-28 border-t border-r border-b p-1 text-center">{formatDayName(item.Date)}</div>
                <div className="w-16 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["Site Avail (%)"])}
                </div>
                <div className="w-16 border-t border-r border-b p-1 text-center">{_formatYn(item["SDSR (%)"])}</div>
                <div className="w-16 border-t border-r border-b p-1 text-center">{_formatYn(item["HOSR (%)"])}</div>
                <div className="w-16 border-t border-r border-b p-1 text-center">{_formatYn(item["DCR (%)"])}</div>
                <div className="w-16 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["TBF UL EST SR (%)"])}
                </div>
                <div className="w-16 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["TBF DL EST SR (%)"])}
                </div>
                <div className="w-16 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["Utilization (%)"])}
                </div>
                <div className="w-16 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["BH Traffic (Erl)"])}
                </div>
                <div className="w-16 border-t border-r border-b p-1 text-center">{_formatYn(item["Payload (MB)"])}</div>
                <div className="w-16 border-t border-r border-b p-1 text-center">
                  {_formatYn(item["ICM BAND (0-5)"])}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

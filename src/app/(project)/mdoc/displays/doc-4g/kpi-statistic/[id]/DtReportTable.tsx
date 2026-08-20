"use client";

// biome-ignore assist/source/organizeImports: <non>
import { useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toJpeg } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SqacTrackerItem } from "@/app/(project)/mdoc/def/interfaces";
import { useSqacStore } from "@/stores/sqacStore";
import { NoDataState } from "@/app/(project)/mdoc/def/additional-component";

interface SqacDtReportItem {
  wid: string;
  dt_rsrp: string | null;
  dt_sinr: string | null;
  dt_dl_thp: string | null;
  long_nodin: string | null;
  long_audit_before: string | null;
  long_audit_after: string | null;
  lat_nodin: string | null;
  lat_audit_before: string | null;
  lat_audit_after: string | null;
  antenna_type_s1: string | null;
  antenna_type_s2: string | null;
  antenna_type_s3: string | null;
  antenna_height_s1: string | null;
  antenna_height_s2: string | null;
  antenna_height_s3: string | null;
  antenna_mt_s1: string | null;
  antenna_mt_s2: string | null;
  antenna_mt_s3: string | null;
  antenna_et_s1: string | null;
  antenna_et_s2: string | null;
  antenna_et_s3: string | null;
  pci: string | null;
  antenna_azm_s1: string | null;
  antenna_azm_s2: string | null;
  antenna_azm_s3: string | null;
}

interface DtReportTableProps {
  wid: string;
}

interface FormData {
  dt_rsrp: string;
  dt_sinr: string;
  dt_dl_thp: string;
  long_nodin: string;
  long_audit_before: string;
  long_audit_after: string;
  lat_nodin: string;
  lat_audit_before: string;
  lat_audit_after: string;
  antenna_type_s1: string;
  antenna_type_s2: string;
  antenna_type_s3: string;
  antenna_height_s1: string;
  antenna_height_s2: string;
  antenna_height_s3: string;
  antenna_mt_s1: string;
  antenna_mt_s2: string;
  antenna_mt_s3: string;
  antenna_et_s1: string;
  antenna_et_s2: string;
  antenna_et_s3: string;
  pci: string;
  antenna_azm_s1: string;
  antenna_azm_s2: string;
  antenna_azm_s3: string;
}

const emptyForm: FormData = {
  dt_rsrp: "",
  dt_sinr: "",
  dt_dl_thp: "",
  long_nodin: "",
  long_audit_before: "",
  long_audit_after: "",
  lat_nodin: "",
  lat_audit_before: "",
  lat_audit_after: "",
  antenna_type_s1: "",
  antenna_type_s2: "",
  antenna_type_s3: "",
  antenna_height_s1: "",
  antenna_height_s2: "",
  antenna_height_s3: "",
  antenna_mt_s1: "",
  antenna_mt_s2: "",
  antenna_mt_s3: "",
  antenna_et_s1: "",
  antenna_et_s2: "",
  antenna_et_s3: "",
  pci: "",
  antenna_azm_s1: "",
  antenna_azm_s2: "",
  antenna_azm_s3: "",
};

export function DtReportTable({ wid }: DtReportTableProps) {
  const { dateEnd } = useSqacStore();

  const afterDay3 = dateEnd ?? "";

  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isExporting, setIsExporting] = useState(false);

  // Refs for export
  const tableInfoRef = useRef<HTMLDivElement>(null);
  const tableKpiRef = useRef<HTMLDivElement>(null);
  const tableAntennaRef = useRef<HTMLDivElement>(null);
  const tableNodinRef = useRef<HTMLDivElement>(null);

  const exportToImage = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    try {
      const imageData = await toJpeg(ref.current, {
        quality: 1.0,
        backgroundColor: "#ffffff",
      });
      const response = await fetch("/mdoc/api/v1/chart-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData, filename }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to export image");
      }
    } catch (err) {
      console.error("Export failed:", err);
      throw err;
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      await exportToImage(tableInfoRef, `${wid}-dtr-info.jpg`);
      await exportToImage(tableKpiRef, `${wid}-dtr-kpi.jpg`);
      await exportToImage(tableAntennaRef, `${wid}-dtr-antenna-config.jpg`);
      await exportToImage(tableNodinRef, `${wid}-dtr-nodin.jpg`);
      toast.success("All tables exported successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export tables");
    } finally {
      setIsExporting(false);
    }
  };

  const { data, isPending, error } = useQuery<SqacDtReportItem[]>({
    queryKey: ["sqac-dt-report", wid],
    queryFn: async () => {
      const response = await fetch(`/mdoc/api/v1/sqac-dt-report?wid=${encodeURIComponent(wid)}`);
      if (!response.ok) throw new Error("Failed to fetch DT report");
      return response.json();
    },
  });

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
    data: dataDtReportNodin,
    isPending: isPendingDtReportNodin,
    error: errorDtReportNodin,
  } = useQuery<SqacTrackerItem[]>({
    queryKey: ["dt-report-nodin", wid],
    queryFn: async () => {
      const response = await fetch(
        `/mdoc/api/v1/dt-report-nodin?siteid=${dataSqacTracker?.[0].siteid}&band=${dataSqacTracker?.[0].band_4g_sow}&city=${dataSqacTracker?.[0].kabupaten}&afterDay3=${afterDay3}`,
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      return response.json();
    },
    enabled: !!wid && !!dataSqacTracker && dataSqacTracker.length > 0,
  });

  // console.log("dataDtReportNodin", dataDtReportNodin);

  const report = data && data.length > 0 ? data[0] : null;

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: FormData) => {
      const res = await fetch("/mdoc/api/v1/sqac-dt-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wid, ...payload }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sqac-dt-report", wid] });
      setIsDialogOpen(false);
      setFormData(emptyForm);
      toast.success("Saved successfully");
    },
    onError: () => {
      toast.error("Failed to save");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/mdoc/api/v1/sqac-dt-report/${encodeURIComponent(wid)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sqac-dt-report", wid] });
      setIsDeleteDialogOpen(false);
      toast.success("Deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete");
    },
  });

  const handleOpenCreate = () => {
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = () => {
    if (report) {
      setFormData({
        dt_rsrp: report.dt_rsrp ?? "",
        dt_sinr: report.dt_sinr ?? "",
        dt_dl_thp: report.dt_dl_thp ?? "",
        long_nodin: report.long_nodin ?? "",
        long_audit_before: report.long_audit_before ?? "",
        long_audit_after: report.long_audit_after ?? "",
        lat_nodin: report.lat_nodin ?? "",
        lat_audit_before: report.lat_audit_before ?? "",
        lat_audit_after: report.lat_audit_after ?? "",
        antenna_type_s1: report.antenna_type_s1 ?? "",
        antenna_type_s2: report.antenna_type_s2 ?? "",
        antenna_type_s3: report.antenna_type_s3 ?? "",
        antenna_height_s1: report.antenna_height_s1 ?? "",
        antenna_height_s2: report.antenna_height_s2 ?? "",
        antenna_height_s3: report.antenna_height_s3 ?? "",
        antenna_mt_s1: report.antenna_mt_s1 ?? "",
        antenna_mt_s2: report.antenna_mt_s2 ?? "",
        antenna_mt_s3: report.antenna_mt_s3 ?? "",
        antenna_et_s1: report.antenna_et_s1 ?? "",
        antenna_et_s2: report.antenna_et_s2 ?? "",
        antenna_et_s3: report.antenna_et_s3 ?? "",
        pci: report.pci ?? "",
        antenna_azm_s1: report.antenna_azm_s1 ?? "",
        antenna_azm_s2: report.antenna_azm_s2 ?? "",
        antenna_azm_s3: report.antenna_azm_s3 ?? "",
      });
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const formatValue = (value: string | null) => value || "-";

  if (isPending) {
    return <div className="text-muted-foreground py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-destructive py-4">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header with Create/Edit/Delete buttons */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">DT Report Data</h3>
        <div className="flex gap-2">
          {report && (
            <Button variant="default" size="sm" onClick={handleExportAll} disabled={isExporting}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Export All
            </Button>
          )}
          {report ? (
            <>
              <Button variant="outline" size="sm" onClick={handleOpenEdit}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                Delete
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={handleOpenCreate}>
              Add Data
            </Button>
          )}
        </div>
      </div>

      {/* Show message when no data */}
      {!report && (
        <div className="py-4 text-muted-foreground">
          No DT Report data available. Click &quot;Add Data&quot; to create.
        </div>
      )}

      {/* Tables when data exists */}
      {report && (
        <>
          {dataSqacTracker?.map((item, _index) => (
            <div key={item.wid}>
              <div className="font-bold text-lg">DRIVE TEST REPORT</div>
              <div ref={tableInfoRef} className="flex w-242 flex-col p-1">
                <div className="flex flex-row">
                  <div className="w-100 shrink-0 border-t border-r border-l p-1 text-center font-bold">PDID</div>
                  <div className="w-140 shrink-0 border-t border-r p-1 text-center">{item.wid.slice(7)}</div>
                </div>
                <div className="flex flex-row">
                  <div className="w-45 shrink-0 border-t border-r border-b border-l p-1 font-bold">Site ID</div>
                  <div className="w-55 shrink-0 border-t border-r border-b p-1 text-center">{item.siteid}</div>
                  <div className="w-45 shrink-0 border-t border-r border-b p-1 font-bold">Site Name</div>
                  <div className="w-95 shrink-0 border-t border-r border-b p-1 text-center">{item.site_name_4g}</div>
                </div>
                <div className="flex flex-row">
                  <div className="w-45 shrink-0 border-r border-b border-l p-1 font-bold">Cell ID</div>
                  <div className="w-55 shrink-0 border-r border-b p-1 text-center">{item.cell_id_4g}</div>
                  <div className="w-45 shrink-0 border-r border-b p-1 font-bold">Band Impact</div>
                  <div className="w-95 shrink-0 border-r border-b p-1 text-center">
                    {item.band_4g_sow}-{item.band_2g_sow}
                  </div>
                </div>
                <div className="flex flex-row">
                  <div className="w-45 shrink-0 border-r border-b border-l p-1 font-bold">TAC/LAC</div>
                  <div className="w-55 shrink-0 border-r border-b p-1 text-center">{item.tac}</div>
                  <div className="w-45 shrink-0 border-r border-b p-1 font-bold">Band Existing Impact</div>
                  <div className="w-95 shrink-0 border-r border-b p-1 text-center">{item.band_existing_impact}</div>
                </div>
                <div className="flex flex-row">
                  <div className="w-45 shrink-0 border-r border-b border-l p-1 font-bold">eNodeB ID</div>
                  <div className="w-55 shrink-0 border-r border-b p-1 text-center">{item.enodeb_id}</div>
                  <div className="w-45 shrink-0 border-r border-b p-1 font-bold">PCI</div>
                  <div className="w-95 shrink-0 border-r border-b p-1 text-center">{report.pci}</div>
                </div>
                <div className="flex flex-row">
                  <div className="w-45 shrink-0 border-r border-b border-l p-1 font-bold">Type of Work</div>
                  <div className="w-55 shrink-0 border-r border-b p-1 text-center">{item.type_of_work}</div>
                  <div className="w-45 shrink-0 border-r border-b p-1 font-bold">CI</div>
                  <div className="w-95 shrink-0 border-r border-b p-1 text-center">{item.cell_id_4g}</div>
                </div>
                <div className="flex flex-row">
                  <div className="w-45 shrink-0 border-r border-b border-l p-1 font-bold">Longitude</div>
                  <div className="w-55 shrink-0 border-r border-b p-1 text-center">{item.longitude}</div>
                  <div className="w-45 shrink-0 border-r border-b p-1 font-bold">Latitude</div>
                  <div className="w-95 shrink-0 border-r border-b p-1 text-center">{item.latitude}</div>
                </div>
                <div className="flex flex-row">
                  <div className="w-45 shrink-0 border-r border-b border-l p-1 font-bold">Connected Date</div>
                  <div className="w-55 shrink-0 border-r border-b p-1 text-center">{item.connected}</div>
                  <div className="w-45 shrink-0 border-r border-b p-1 font-bold">Integration Date</div>
                  <div className="w-95 shrink-0 border-r border-b p-1 text-center">{item.connected}</div>
                </div>
                <div className="flex flex-row">
                  <div className="w-45 shrink-0 border-r border-b border-l p-1 font-bold">PO ID</div>
                  <div className="w-55 shrink-0 border-r border-b p-1 text-center">{item.po_id}</div>
                  <div className="w-45 shrink-0 border-r border-b p-1 font-bold">Audit Date</div>
                  <div className="w-95 shrink-0 border-r border-b p-1 text-center">{item.audit}</div>
                </div>
              </div>
            </div>
          ))}
          <div className="flex w-227 flex-col p-1" ref={tableKpiRef}>
            <div className="flex flex-row bg-blue-200">
              <div className="w-85 shrink-0 border-t border-r border-b border-l p-1 font-bold ">
                KEY PERFORMANCE INDICATOR DRIVETEST
              </div>
              <div className="w-35 shrink-0 border-t border-r border-b p-1 font-bold text-center">SERVICE</div>
              <div className="w-35 shrink-0 border-t border-r border-b p-1 font-bold text-center">TARGET</div>
              <div className="w-35 shrink-0 border-t border-r border-b p-1 font-bold text-center">RESULT</div>
              <div className="w-35 shrink-0 border-t border-r border-b p-1 font-bold text-center">PASS / FAIL</div>
            </div>
            <div className="flex flex-row">
              <div className="w-85 shrink-0 border-r border-b border-l p-1">RSRP {">"}= -110 dBm (CovMo-MDT)</div>
              <div className="w-35 shrink-0 border-r border-b p-1 text-center">Coverage</div>
              <div className="w-35 shrink-0 border-r border-b p-1 text-center">{">"}-110 dBm</div>
              <div className="w-35 shrink-0 border-r border-b p-1 text-center">{report.dt_sinr}</div>
              <div className="w-35 shrink-0 border-r border-b p-1 text-center">As Info</div>
            </div>
            <div className="flex flex-row">
              <div className="w-85 shrink-0 border-r border-b border-l p-1">SINR {">"}= 0 dBm (Dedicated)</div>
              <div className="w-35 shrink-0 border-r border-b p-1 text-center">Coverage</div>
              <div className="w-35 shrink-0 border-r border-b p-1 text-center">90%{">"}0 dBm</div>
              <div className="w-35 shrink-0 border-r border-b p-1 text-center">{report.dt_rsrp}</div>
              <div className="w-35 shrink-0 border-r border-b p-1 text-center">As Info</div>
            </div>
            <div className="flex flex-row">
              <div className="w-85 shrink-0 border-r border-b border-l p-1">Average DL Thp (CovMo-Traffic)</div>
              <div className="w-35 shrink-0 border-r border-b p-1 text-center">Throughput</div>
              <div className="w-35 shrink-0 border-r border-b p-1 text-center">{">"}= 5 Mbps</div>
              <div className="w-35 shrink-0 border-r border-b p-1 text-center">{report.dt_dl_thp}</div>
              <div className="w-35 shrink-0 border-r border-b p-1 text-center">As Info</div>
            </div>
          </div>
          <div className="flex w-312 flex-col p-1" ref={tableAntennaRef}>
            <div className="flex flex-row bg-blue-200">
              <div className="w-15 shrink-0 border-t border-r border-l p-1 text-center font-bold">No</div>
              <div className="w-45 shrink-0 border-t border-r p-1 text-center font-bold">ITEM VERIFIED</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center font-bold">PLANNING / NODIN DATA</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center font-bold">
                SITE AUDIT BEFORE <br /> ( {dataSqacTracker?.[0]?.audit} )
              </div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center font-bold">
                SITE AUDIT AFTER <br /> ( {dataSqacTracker?.[0]?.audit} )
              </div>
              <div className="w-25 shrink-0 border-t border-r p-1 text-center font-bold">REMARK</div>
            </div>
            <div className="flex flex-row">
              <div className="w-15 shrink-0 border-t border-r border-l p-1 text-center">1</div>
              <div className="w-45 shrink-0 border-t border-r p-1 text-center">SITE LONGITUDE</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">{report.long_nodin}</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">{report.long_audit_before}</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">{report.long_audit_after}</div>
              <div className="w-25 shrink-0 border-t border-r p-1 text-center">-</div>
            </div>
            <div className="flex flex-row">
              <div className="w-15 shrink-0 border-t border-r border-l p-1 text-center">2</div>
              <div className="w-45 shrink-0 border-t border-r p-1 text-center">SITE LATITUDE</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">{report.lat_nodin}</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">{report.lat_audit_before}</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">{report.lat_audit_after}</div>
              <div className="w-25 shrink-0 border-t border-r p-1 text-center">-</div>
            </div>
            <div className="flex flex-row">
              <div className="w-15 shrink-0 border-t border-r border-l p-1 text-center">3</div>
              <div className="w-45 shrink-0 border-t border-r p-1 text-center">ANTENNA TYPE</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">
                {report.antenna_type_s1} / {report.antenna_type_s2} / {report.antenna_type_s3}
              </div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">
                {report.antenna_type_s1} / {report.antenna_type_s2} / {report.antenna_type_s3}
              </div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">
                {report.antenna_type_s1} / {report.antenna_type_s2} / {report.antenna_type_s3}
              </div>
              <div className="w-25 shrink-0 border-t border-r p-1 text-center">-</div>
            </div>
            <div className="flex flex-row">
              <div className="w-15 shrink-0 border-t border-r border-l p-1 text-center">4</div>
              <div className="w-45 shrink-0 border-t border-r p-1 text-center">ANTENNA HEIGHT</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">
                {report.antenna_height_s1} / {report.antenna_height_s2} / {report.antenna_height_s3}
              </div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">
                {report.antenna_height_s1} / {report.antenna_height_s2} / {report.antenna_height_s3}
              </div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">
                {report.antenna_height_s1} / {report.antenna_height_s2} / {report.antenna_height_s3}
              </div>
              <div className="w-25 shrink-0 border-t border-r p-1 text-center">-</div>
            </div>
            <div className="flex flex-row">
              <div className="w-15 shrink-0 border-t border-r border-l p-1 text-center">5</div>
              <div className="w-45 shrink-0 border-t border-r p-1 text-center">MECHANICAL TILT</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">
                {report.antenna_mt_s1} / {report.antenna_mt_s2} / {report.antenna_mt_s3}
              </div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">
                {report.antenna_mt_s1} / {report.antenna_mt_s2} / {report.antenna_mt_s3}
              </div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">
                {report.antenna_mt_s1} / {report.antenna_mt_s2} / {report.antenna_mt_s3}
              </div>
              <div className="w-25 shrink-0 border-t border-r p-1 text-center">-</div>
            </div>
            <div className="flex flex-row">
              <div className="w-15 shrink-0 border-t border-r border-l p-1 text-center">6</div>
              <div className="w-45 shrink-0 border-t border-r p-1 text-center">ELECTRICAL TILT</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">
                {report.antenna_et_s1} / {report.antenna_et_s2} / {report.antenna_et_s3}
              </div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">
                {report.antenna_et_s1} / {report.antenna_et_s2} / {report.antenna_et_s3}
              </div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">
                {report.antenna_et_s1} / {report.antenna_et_s2} / {report.antenna_et_s3}
              </div>
              <div className="w-25 shrink-0 border-t border-r p-1 text-center">-</div>
            </div>
            <div className="flex flex-row">
              <div className="w-15 shrink-0 border-t border-r border-l p-1 text-center">7</div>
              <div className="w-45 shrink-0 border-t border-r p-1 text-center">AZIMUTH</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">
                {report.antenna_azm_s1} / {report.antenna_azm_s2} / {report.antenna_azm_s3}
              </div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">
                {report.antenna_azm_s1} / {report.antenna_azm_s2} / {report.antenna_azm_s3}
              </div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">
                {report.antenna_azm_s1} / {report.antenna_azm_s2} / {report.antenna_azm_s3}
              </div>
              <div className="w-25 shrink-0 border-t border-r p-1 text-center">-</div>
            </div>
            <div className="flex flex-row">
              <div className="w-15 shrink-0 border-t border-r border-l p-1 text-center">8</div>
              <div className="w-45 shrink-0 border-t border-r p-1 text-center">FEEDER TYPE</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">FEEDERLESS</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">FEEDERLESS</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">FEEDERLESS</div>
              <div className="w-25 shrink-0 border-t border-r p-1 text-center">-</div>
            </div>
            <div className="flex flex-row">
              <div className="w-15 shrink-0 border-t border-r border-l p-1 text-center">9</div>
              <div className="w-45 shrink-0 border-t border-r p-1 text-center">FEEDER LENGTH</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">-</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">-</div>
              <div className="w-75 shrink-0 border-t border-r p-1 text-center">-</div>
              <div className="w-25 shrink-0 border-t border-r p-1 text-center">-</div>
            </div>
            <div className="flex flex-row">
              <div className="w-15 shrink-0 border-t border-r border-b border-l p-1 text-center">10</div>
              <div className="w-45 shrink-0 border-t border-r border-b p-1 text-center">ANTENNA COMBINE</div>
              <div className="w-75 shrink-0 border-t border-r border-b p-1 text-center">{"-"}</div>
              <div className="w-75 shrink-0 border-t border-r border-b p-1 text-center">{"-"}</div>
              <div className="w-75 shrink-0 border-t border-r border-b p-1 text-center">{"-"}</div>
              <div className="w-25 shrink-0 border-t border-r border-b p-1 text-center">{"-"}</div>
            </div>
          </div>

          {/* Table DT report nodin */}
          {isPendingDtReportNodin && <div className="text-muted-foreground">Loading...</div>}
          {errorDtReportNodin && <div className="text-destructive">Error: {errorDtReportNodin.message}</div>}

          {!dataDtReportNodin || dataDtReportNodin.length === 0 ? (
            <NoDataState message="No data available for the selected criteria." />
          ) : (
            <div key={"table-dt-report-nodin"} ref={tableNodinRef} className="w-258 overflow-x-auto p-1">
              <div className="flex flex-col">
                <div className="flex flex-row flex-nowrap bg-blue-200">
                  <div className="w-20 shrink-0 content-center border-neutral-500 border-t border-r border-b border-l p-1 text-center">
                    SiteId
                  </div>
                  <div className="w-70 shrink-0 content-center border-neutral-500 border-t border-r border-b p-1 text-center">
                    NeidName
                  </div>
                  <div className="w-70 shrink-0 content-center border-neutral-500 border-t border-r border-b p-1 text-center">
                    CellName_Prep
                  </div>
                  <div className="w-15 shrink-0 content-center border-neutral-500 border-t border-r border-b p-1 text-center">
                    Band
                  </div>
                  <div className="w-20 shrink-0 content-center border-neutral-500 border-t border-r border-b p-1 text-center">
                    Sector
                  </div>
                  <div className="w-15 shrink-0 content-center border-neutral-500 border-t border-r border-b p-1 text-center">
                    CI
                  </div>
                  <div className="w-23 shrink-0 content-center border-neutral-500 border-t border-r border-b p-1 text-center">
                    Longitude
                  </div>
                  <div className="w-23 shrink-0 content-center border-neutral-500 border-t border-r border-b p-1 text-center">
                    Latitude
                  </div>
                </div>
                {dataDtReportNodin.map((item) => (
                  <div key={item.cellid} className="flex flex-row flex-nowrap">
                    <div className="w-20 shrink-0 border-neutral-500 border-r border-b border-l p-1 text-center">
                      {item.siteid}
                    </div>
                    <div className="wrap-break-word w-70 shrink-0 border-neutral-500 border-r border-b p-1">
                      {item.enodeb_name}
                    </div>
                    <div className="wrap-break-word w-70 shrink-0 border-neutral-500 border-r border-b p-1">
                      {item.cell_name}
                    </div>
                    <div className="w-15 shrink-0 border-neutral-500 border-r border-b p-1 text-center">
                      {item.band}
                    </div>
                    <div className="w-20 shrink-0 border-neutral-500 border-r border-b p-1 text-center">
                      Sector-{item.sector.slice(7)}
                    </div>
                    <div className="w-15 shrink-0 border-neutral-500 border-r border-b p-1 text-center">
                      {item.cellid}
                    </div>
                    <div className="w-23 shrink-0 border-neutral-500 border-r border-b p-1 text-center">
                      {report.long_nodin}
                    </div>
                    <div className="w-23 shrink-0 border-neutral-500 border-r border-b p-1 text-center">
                      {report.lat_nodin}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* <div>
            <h4 className="font-medium mb-2 text-sm text-muted-foreground">
              Drive Test Metrics
            </h4>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RSRP</TableHead>
                    <TableHead>SINR</TableHead>
                    <TableHead>DL Throughput</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{formatValue(report.dt_rsrp)}</TableCell>
                    <TableCell>{formatValue(report.dt_sinr)}</TableCell>
                    <TableCell>{formatValue(report.dt_dl_thp)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm text-muted-foreground">
              Longitude
            </h4>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nodin</TableHead>
                    <TableHead>Audit Before</TableHead>
                    <TableHead>Audit After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{formatValue(report.long_nodin)}</TableCell>
                    <TableCell>
                      {formatValue(report.long_audit_before)}
                    </TableCell>
                    <TableCell>
                      {formatValue(report.long_audit_after)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm text-muted-foreground">
              Latitude
            </h4>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nodin</TableHead>
                    <TableHead>Audit Before</TableHead>
                    <TableHead>Audit After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{formatValue(report.lat_nodin)}</TableCell>
                    <TableCell>
                      {formatValue(report.lat_audit_before)}
                    </TableCell>
                    <TableCell>{formatValue(report.lat_audit_after)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm text-muted-foreground">
              Antenna Type
            </h4>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sector 1</TableHead>
                    <TableHead>Sector 2</TableHead>
                    <TableHead>Sector 3</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{formatValue(report.antenna_type_s1)}</TableCell>
                    <TableCell>{formatValue(report.antenna_type_s2)}</TableCell>
                    <TableCell>{formatValue(report.antenna_type_s3)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm text-muted-foreground">
              Antenna Height
            </h4>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sector 1</TableHead>
                    <TableHead>Sector 2</TableHead>
                    <TableHead>Sector 3</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      {formatValue(report.antenna_height_s1)}
                    </TableCell>
                    <TableCell>
                      {formatValue(report.antenna_height_s2)}
                    </TableCell>
                    <TableCell>
                      {formatValue(report.antenna_height_s3)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm text-muted-foreground">
              Antenna MT (Mechanical Tilt)
            </h4>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sector 1</TableHead>
                    <TableHead>Sector 2</TableHead>
                    <TableHead>Sector 3</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{formatValue(report.antenna_mt_s1)}</TableCell>
                    <TableCell>{formatValue(report.antenna_mt_s2)}</TableCell>
                    <TableCell>{formatValue(report.antenna_mt_s3)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm text-muted-foreground">
              Antenna ET (Electrical Tilt)
            </h4>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sector 1</TableHead>
                    <TableHead>Sector 2</TableHead>
                    <TableHead>Sector 3</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{formatValue(report.antenna_et_s1)}</TableCell>
                    <TableCell>{formatValue(report.antenna_et_s2)}</TableCell>
                    <TableCell>{formatValue(report.antenna_et_s3)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div> */}
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl! overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{report ? "Edit DT Report" : "Add DT Report"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="wid">WID</Label>
              <Input id="wid" value={wid} disabled className="bg-muted" />
            </div>

            <div>
              <Label className="text-sm font-semibold">Drive Test Metrics</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="dt_rsrp" className="text-xs">
                    RSRP
                  </Label>
                  <Input
                    id="dt_rsrp"
                    value={formData.dt_rsrp}
                    onChange={(e) => setFormData({ ...formData, dt_rsrp: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dt_sinr" className="text-xs">
                    SINR
                  </Label>
                  <Input
                    id="dt_sinr"
                    value={formData.dt_sinr}
                    onChange={(e) => setFormData({ ...formData, dt_sinr: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dt_dl_thp" className="text-xs">
                    DL Throughput
                  </Label>
                  <Input
                    id="dt_dl_thp"
                    value={formData.dt_dl_thp}
                    onChange={(e) => setFormData({ ...formData, dt_dl_thp: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Longitude</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="long_nodin" className="text-xs">
                    Nodin
                  </Label>
                  <Input
                    id="long_nodin"
                    value={formData.long_nodin}
                    onChange={(e) => setFormData({ ...formData, long_nodin: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="long_audit_before" className="text-xs">
                    Audit Before
                  </Label>
                  <Input
                    id="long_audit_before"
                    value={formData.long_audit_before}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        long_audit_before: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="long_audit_after" className="text-xs">
                    Audit After
                  </Label>
                  <Input
                    id="long_audit_after"
                    value={formData.long_audit_after}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        long_audit_after: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Latitude</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="lat_nodin" className="text-xs">
                    Nodin
                  </Label>
                  <Input
                    id="lat_nodin"
                    value={formData.lat_nodin}
                    onChange={(e) => setFormData({ ...formData, lat_nodin: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lat_audit_before" className="text-xs">
                    Audit Before
                  </Label>
                  <Input
                    id="lat_audit_before"
                    value={formData.lat_audit_before}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lat_audit_before: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="lat_audit_after" className="text-xs">
                    Audit After
                  </Label>
                  <Input
                    id="lat_audit_after"
                    value={formData.lat_audit_after}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lat_audit_after: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Antenna Type</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="antenna_type_s1" className="text-xs">
                    Sector 1
                  </Label>
                  <Input
                    id="antenna_type_s1"
                    value={formData.antenna_type_s1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antenna_type_s1: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="antenna_type_s2" className="text-xs">
                    Sector 2
                  </Label>
                  <Input
                    id="antenna_type_s2"
                    value={formData.antenna_type_s2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antenna_type_s2: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="antenna_type_s3" className="text-xs">
                    Sector 3
                  </Label>
                  <Input
                    id="antenna_type_s3"
                    value={formData.antenna_type_s3}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antenna_type_s3: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Antenna Height</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="antenna_height_s1" className="text-xs">
                    Sector 1
                  </Label>
                  <Input
                    id="antenna_height_s1"
                    value={formData.antenna_height_s1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antenna_height_s1: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="antenna_height_s2" className="text-xs">
                    Sector 2
                  </Label>
                  <Input
                    id="antenna_height_s2"
                    value={formData.antenna_height_s2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antenna_height_s2: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="antenna_height_s3" className="text-xs">
                    Sector 3
                  </Label>
                  <Input
                    id="antenna_height_s3"
                    value={formData.antenna_height_s3}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antenna_height_s3: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Antenna MT (Mechanical Tilt)</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="antenna_mt_s1" className="text-xs">
                    Sector 1
                  </Label>
                  <Input
                    id="antenna_mt_s1"
                    value={formData.antenna_mt_s1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antenna_mt_s1: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="antenna_mt_s2" className="text-xs">
                    Sector 2
                  </Label>
                  <Input
                    id="antenna_mt_s2"
                    value={formData.antenna_mt_s2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antenna_mt_s2: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="antenna_mt_s3" className="text-xs">
                    Sector 3
                  </Label>
                  <Input
                    id="antenna_mt_s3"
                    value={formData.antenna_mt_s3}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antenna_mt_s3: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Antenna ET (Electrical Tilt)</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="antenna_et_s1" className="text-xs">
                    Sector 1
                  </Label>
                  <Input
                    id="antenna_et_s1"
                    value={formData.antenna_et_s1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antenna_et_s1: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="antenna_et_s2" className="text-xs">
                    Sector 2
                  </Label>
                  <Input
                    id="antenna_et_s2"
                    value={formData.antenna_et_s2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antenna_et_s2: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="antenna_et_s3" className="text-xs">
                    Sector 3
                  </Label>
                  <Input
                    id="antenna_et_s3"
                    value={formData.antenna_et_s3}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antenna_et_s3: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="pci" className="text-sm font-semibold">
                PCI
              </Label>
              <div className="mt-2">
                <Input
                  id="pci"
                  value={formData.pci}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pci: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Antenna Azimuth</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="antenna_azm_s1" className="text-xs">
                    Sector 1
                  </Label>
                  <Input
                    id="antenna_azm_s1"
                    value={formData.antenna_azm_s1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antenna_azm_s1: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="antenna_azm_s2" className="text-xs">
                    Sector 2
                  </Label>
                  <Input
                    id="antenna_azm_s2"
                    value={formData.antenna_azm_s2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antenna_azm_s2: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="antenna_azm_s3" className="text-xs">
                    Sector 3
                  </Label>
                  <Input
                    id="antenna_azm_s3"
                    value={formData.antenna_azm_s3}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antenna_azm_s3: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete DT Report</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this DT Report data for WID &quot;
            {wid}&quot;? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

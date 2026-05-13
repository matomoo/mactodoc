/**
 * generateNetworkReport.ts
 * Next.js client-side PPTX export utility for LTE Network KPI data
 * Usage: import and call reportPerformance(filteredData, undefined, selectedKpis)
 *
 * Dependencies: pptxgenjs
 * Install: npm install pptxgenjs
 */
/** biome-ignore-all lint/suspicious/noExplicitAny: <none> */

import type PptxGenJS from "pptxgenjs";

// ─── RAW DATA TYPES ───────────────────────────────────────────────────────────

export interface RawKpiRow {
  BEGIN_TIME: string;
  G4_NOP?: string;
  G4_AGGRBY: string;
  G4_AGGRBY2?: string;
  G4_SITEID?: string;
  G4_SITEID_CELLID?: string;
  DL_PAYLOAD_GB: number;
  UL_PAYLOAD_GB: number;
  TOTAL_PAYLOAD_GB: number;
  TOTAL_PAYLOAD_TB: number;
  TRAFFIC_VOLTE_ERL: number;
  TRAFFIC_VOLTE_KERL: number;
  G4_SUM_MAX_NUMBER_RRC_CONNECTION_USER: number;
  AVAILABILITY_NUM: number;
  AVAILABILITY_DENUM: number;
  G4_RRC_SETUP_SR_NUM: number;
  G4_RRC_SETUP_SR_DENUM: number;
  G4_ERAB_SETUP_SR_NUM: number;
  G4_ERAB_SETUP_SR_DENUM: number;
  G4_CSSR_NUM: number;
  G4_CSSR_DENUM: number;
  G4_SERVICE_DROP_RATE_NUM: number;
  G4_SERVICE_DROP_RATE_DENUM: number;
  G4_DL_PRB_UTILIZATION_NUM: number;
  G4_DL_PRB_UTILIZATION_DENUM: number;
  G4_UL_PRB_UTILIZATION_NUM: number;
  G4_UL_PRB_UTILIZATION_DENUM: number;
  G4_USER_DL_THP_NUM: number;
  G4_USER_DL_THP_DENUM: number;
  G4_USER_UL_THP_NUM: number;
  G4_USER_UL_THP_DENUM: number;
  G4_DL_RB_AVAILABLE: number;
  G4_SE_NUM: number;
  G4_SE_DENUM: number;
  G4_AVG_CQI_NUM: number;
  G4_AVG_CQI_DENUM: number;
  G4_AVG_NI_CARRIER_DBM: number;
  G4_CSFB_SETUP_SR_NUM: number;
  G4_CSFB_SETUP_SR_DENUM: number;
  G4_IFHO_SR_NUM: number;
  G4_IFHO_SR_DENUM: number;
  G4_INTER_FHO_SR_NUM: number;
  G4_INTER_FHO_SR_DENUM: number;
  G4_SRVCC_E2G_SR_NUM: number;
  G4_SRVCC_E2G_SR_DENUM: number;
  G4_SRVCC_E2W_SR_NUM: number;
  G4_SRVCC_E2W_SR_DENUM: number;
  DENUMBY1: string;
}

// ─── PACKET LOSS DATA TYPE ────────────────────────────────────────────────────

export interface PlosRow {
  "Begin Time": string;
  siteid: string;
  nop: string;
  aggrby: string;
  "FAIL Count": number;
  "Avg Packet Loss Rate": number;
  "Avg Delay": number;
  "Avg Jitter": number;
}

export interface RawKpiPlos4G {
  rows: PlosRow[];
}

// ─── COMPARISON DATA TYPE ─────────────────────────────────────────────────────

export interface ComparisonRow {
  /** Human-readable metric label, e.g. "Total Payload (GB)" */
  metric: string;
  /** Raw KPI field name, e.g. "TOTAL_PAYLOAD_GB" */
  metric_num: string;
  /** Value from the "before" period */
  before: number;
  /** Value from the "after" period */
  after: number;
  /** after − before */
  delta: number;
  /** Absolute percentage change */
  growth: number;
  /** Technology label, e.g. "4G" */
  tech: string;
}

// ─── REMARK LOGIC ─────────────────────────────────────────────────────────────
//
// Mirrors the className rule in your UI component:
//   growth > 2 && delta > 0  →  "Good"      (green)
//   growth > 2 && delta < 0  →  "Degraded"  (red)
//   otherwise                →  "Stable"    (yellow/amber)

type RemarkStatus = "Improve" | "Degrade" | "Maintain";

interface RemarkStyle {
  label: RemarkStatus;
  /** Hex fill color for the remark cell (no #) */
  fillColor: string;
  /** Hex text color for the remark cell (no #) */
  textColor: string;
}

function getRemarkStyle(row: ComparisonRow): RemarkStyle {
  if (row.growth > 2 && row.delta > 0) {
    return { label: "Improve", fillColor: "DCFCE7", textColor: "166534" }; // green-100 / green-800
  }
  if (row.growth > 2 && row.delta < 0) {
    return { label: "Degrade", fillColor: "FEE2E2", textColor: "991B1B" }; // red-100   / red-800
  }
  return { label: "Maintain", fillColor: "FEF9C3", textColor: "854D0E" }; // yellow-100/ yellow-800
}

// ─── SUPPORTED KPI KEYS ───────────────────────────────────────────────────────

export type KpiKey =
  | "TOTAL_PAYLOAD_GB"
  | "DL_PAYLOAD_GB"
  | "UL_PAYLOAD_GB"
  | "TRAFFIC_VOLTE_ERL"
  | "TRAFFIC_VOLTE_KERL"
  | "G4_SUM_MAX_NUMBER_RRC_CONNECTION_USER"
  | "AVAILABILITY_NUM"
  | "G4_RRC_SETUP_SR_NUM"
  | "G4_ERAB_SETUP_SR_NUM"
  | "G4_CSSR_NUM"
  | "G4_SERVICE_DROP_RATE_NUM"
  | "G4_DL_PRB_UTILIZATION_NUM"
  | "G4_UL_PRB_UTILIZATION_NUM"
  | "G4_USER_DL_THP_NUM"
  | "G4_USER_UL_THP_NUM"
  | "G4_SE_NUM"
  | "G4_AVG_CQI_NUM"
  | "G4_AVG_NI_CARRIER_DBM"
  | "G4_IFHO_SR_NUM"
  | "G4_INTER_FHO_SR_NUM"
  | "G4_CSFB_SETUP_SR_NUM"
  | "G4_SRVCC_E2G_SR_NUM";

// ─── COMPUTED KPI TYPES ───────────────────────────────────────────────────────

interface ComputedKpi {
  date: string;
  totalPayloadTB: number;
  dlPayloadGB: number;
  ulPayloadGB: number;
  voltErl: number;
  voltKErl: number;
  rrcUsers: number;
  availability: number;
  rrcSetupSR: number;
  erabSetupSR: number;
  cssr: number;
  dropRate: number;
  dlPrbUtil: number;
  ulPrbUtil: number;
  dlThroughput: number;
  ulThroughput: number;
  seBh: number;
  avgCQI: number;
  avgNiCarrier: number;
  ifhoSR: number;
  interfhoSR: number;
  csfbSR: number;
  srvccSR: number | null;
}

// ─── KPI REGISTRY ─────────────────────────────────────────────────────────────

interface KpiConfig {
  title: string;
  chartType: "line" | "bar";
  unit: string;
  unitCell?: string; // override unit for cell/site granularity
  decimals: number;
  decimalsCell?: number; // override decimals for cell/site granularity
  getValue: (k: ComputedKpi) => number | null;
  color?: string;
}

export const KPI_REGISTRY: Record<KpiKey, KpiConfig> = {
  TOTAL_PAYLOAD_GB: {
    title: "Total Payload",
    chartType: "line",
    unit: "TB",
    unitCell: "GB",
    decimals: 0,
    decimalsCell: 2,
    getValue: (k) => k.totalPayloadTB,
    color: "0D9488",
  },
  DL_PAYLOAD_GB: {
    title: "Downlink Payload",
    chartType: "line",
    unit: "TB",
    unitCell: "GB",
    decimals: 2,
    decimalsCell: 2,
    getValue: (k) => k.dlPayloadGB,
    color: "0369A1",
  },
  UL_PAYLOAD_GB: {
    title: "Uplink Payload",
    chartType: "line",
    unit: "TB",
    unitCell: "GB",
    decimals: 2,
    decimalsCell: 2,
    getValue: (k) => k.ulPayloadGB,
    color: "F59E0B",
  },
  TRAFFIC_VOLTE_ERL: {
    title: "VoLTE Traffic",
    chartType: "line",
    unit: "Erl",
    decimals: 0,
    getValue: (k) => k.voltErl,
    color: "7C3AED",
  },
  TRAFFIC_VOLTE_KERL: {
    title: "VoLTE Traffic (K)",
    chartType: "line",
    unit: "Erl",
    decimals: 0,
    getValue: (k) => k.voltKErl,
    color: "7C3AED",
  },
  G4_SUM_MAX_NUMBER_RRC_CONNECTION_USER: {
    title: "Max RRC Connected Users",
    chartType: "line",
    unit: "M Users",
    decimals: 3,
    getValue: (k) => k.rrcUsers,
    color: "1D4ED8",
  },
  AVAILABILITY_NUM: {
    title: "Network Availability",
    chartType: "line",
    unit: "%",
    decimals: 4,
    getValue: (k) => k.availability,
    color: "059669",
  },
  G4_RRC_SETUP_SR_NUM: {
    title: "RRC Setup Success Rate",
    chartType: "line",
    unit: "%",
    decimals: 4,
    getValue: (k) => k.rrcSetupSR,
    color: "1D4ED8",
  },
  G4_ERAB_SETUP_SR_NUM: {
    title: "ERAB Setup Success Rate",
    chartType: "line",
    unit: "%",
    decimals: 4,
    getValue: (k) => k.erabSetupSR,
    color: "7C3AED",
  },
  G4_CSSR_NUM: {
    title: "Call Setup Success Rate (CSSR)",
    chartType: "line",
    unit: "%",
    decimals: 4,
    getValue: (k) => k.cssr,
    color: "0D9488",
  },
  G4_SERVICE_DROP_RATE_NUM: {
    title: "Service Drop Rate",
    chartType: "line",
    unit: "%",
    decimals: 4,
    getValue: (k) => k.dropRate,
    color: "DC2626",
  },
  G4_DL_PRB_UTILIZATION_NUM: {
    title: "DL PRB Utilization",
    chartType: "line",
    unit: "%",
    decimals: 2,
    getValue: (k) => k.dlPrbUtil,
    color: "0D9488",
  },
  G4_UL_PRB_UTILIZATION_NUM: {
    title: "UL PRB Utilization",
    chartType: "line",
    unit: "%",
    decimals: 2,
    getValue: (k) => k.ulPrbUtil,
    color: "F59E0B",
  },
  G4_USER_DL_THP_NUM: {
    title: "DL User Throughput",
    chartType: "line",
    unit: "Mbps",
    decimals: 2,
    getValue: (k) => k.dlThroughput,
    color: "0D9488",
  },
  G4_USER_UL_THP_NUM: {
    title: "UL User Throughput",
    chartType: "line",
    unit: "Mbps",
    decimals: 2,
    getValue: (k) => k.ulThroughput,
    color: "0369A1",
  },
  G4_SE_NUM: {
    title: "SE BH",
    chartType: "line",
    unit: "",
    decimals: 2,
    getValue: (k) => k.seBh,
    color: "F59E0B",
  },
  G4_AVG_CQI_NUM: {
    title: "Average CQI",
    chartType: "line",
    unit: "",
    decimals: 2,
    getValue: (k) => k.avgCQI,
    color: "F59E0B",
  },
  G4_AVG_NI_CARRIER_DBM: {
    title: "Average NI Carrier (dBm)",
    chartType: "line",
    unit: "dBm",
    decimals: 2,
    getValue: (k) => k.avgNiCarrier,
    color: "F59E0B",
  },
  G4_IFHO_SR_NUM: {
    title: "Intra-Freq Handover SR",
    chartType: "line",
    unit: "%",
    decimals: 3,
    getValue: (k) => k.ifhoSR,
    color: "0369A1",
  },
  G4_INTER_FHO_SR_NUM: {
    title: "Inter-Freq Handover SR",
    chartType: "line",
    unit: "%",
    decimals: 3,
    getValue: (k) => k.interfhoSR,
    color: "0369A1",
  },
  G4_CSFB_SETUP_SR_NUM: {
    title: "CSFB Setup Success Rate",
    chartType: "line",
    unit: "%",
    decimals: 3,
    getValue: (k) => k.csfbSR,
    color: "F59E0B",
  },
  G4_SRVCC_E2G_SR_NUM: {
    title: "SRVCC E2G Success Rate",
    chartType: "line",
    unit: "%",
    decimals: 3,
    getValue: (k) => k.srvccSR,
    color: "7C3AED",
  },
};

const CELL_LEVEL_GROUPBY = new Set(["G4_SITEID_CELLID", "G4_SITEID", "G4_AGGRBY2", "G4_AGGRBY"]);

// ─── HELPER: resolve unit and decimals from config based on groupBy ───────────

function resolveKpiConfig(config: KpiConfig, groupBy: string): { unit: string; decimals: number } {
  const isCell = CELL_LEVEL_GROUPBY.has(groupBy);
  return {
    unit: isCell ? (config.unitCell ?? config.unit) : config.unit,
    decimals: isCell ? (config.decimalsCell ?? config.decimals) : config.decimals,
  };
}

// ─── THEME ────────────────────────────────────────────────────────────────────

const THEME = {
  navy: "0A1628",
  navyMid: "112240",
  teal: "0D9488",
  tealLight: "14B8A6",
  accent: "F59E0B",
  white: "FFFFFF",
  offWhite: "F8FAFC",
  slate: "64748B",
  slateLight: "CBD5E1",
  dark: "1E293B",
} as const;

const FONT = {
  title: "Calibri",
  body: "Calibri",
} as const;

// ─── KPI COMPUTATION ──────────────────────────────────────────────────────────

export interface KpiGroup {
  nop: string;
  kpis: ComputedKpi[];
}

// ─── HELPER: build a unified sorted date label array across all groups ────────

function buildUnifiedLabels(groups: KpiGroup[]): string[] {
  const dateSet = new Set<string>();
  for (const g of groups) {
    for (const k of g.kpis) {
      dateSet.add(k.date);
    }
  }
  // Sort chronologically — dates are "DD Mon" e.g. "15 Apr"
  return Array.from(dateSet).sort((a, b) => {
    return new Date(`${a} 2026`).getTime() - new Date(`${b} 2026`).getTime();
  });
}

// ─── HELPER: align a group's kpis to a unified label array ───────────────────
// Returns values array with 0 for any date the group has no data for.

function alignValues(
  group: KpiGroup,
  labels: string[],
  getValue: (k: ComputedKpi) => number | null,
  decimals: number,
): number[] {
  // Build a quick lookup: date string → computed value
  const map = new Map<string, number>();
  for (const k of group.kpis) {
    const v = getValue(k);
    map.set(k.date, parseFloat(fmt(v ?? 0, decimals)));
  }
  // For each label, return the value or 0 if missing
  return labels.map((label) => map.get(label) ?? 0);
}

// ─── UPDATED: computeKPIsByNop — detect cell-level grouping ──────────────────

function computeKPIsByNop(data: RawKpiRow[], groupBy: string): KpiGroup[] {
  const grouped = new Map<string, RawKpiRow[]>();
  for (const row of data) {
    const nop = row.G4_NOP ?? row.G4_AGGRBY ?? row.G4_AGGRBY2 ?? row.G4_SITEID_CELLID ?? row.G4_SITEID ?? "UNKNOWN";
    if (!grouped.has(nop)) grouped.set(nop, []);
    grouped.get(nop)?.push(row);
  }

  const isCellGranularity =
    groupBy === "G4_SITEID" || groupBy === "G4_SITEID_CELLID" || groupBy === "G4_AGGRBY" || groupBy === "G4_AGGRBY2";

  return Array.from(grouped.entries()).map(([nop, rows]) => ({
    nop,
    kpis: computeKPIs(rows, isCellGranularity),
  }));
}

// ─── UPDATED: Multi-series color palette ──────────────────────────────────────

const SERIES_COLORS = [
  "0D9488", // teal
  "F59E0B", // amber
  "3B82F6", // blue
  "EF4444", // red
  "8B5CF6", // violet
  "10B981", // emerald
  "F97316", // orange
  "EC4899", // pink
];

function computeKPIs(data: RawKpiRow[], useCellGranularity = false): ComputedKpi[] {
  return data.map((row) => {
    const date = new Date(row.BEGIN_TIME).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
    return {
      date,
      totalPayloadTB: useCellGranularity ? row.TOTAL_PAYLOAD_GB : row.TOTAL_PAYLOAD_TB,
      dlPayloadGB: row.DL_PAYLOAD_GB / 1_000,
      ulPayloadGB: row.UL_PAYLOAD_GB / 1_000,
      voltErl: row.TRAFFIC_VOLTE_ERL,
      voltKErl: useCellGranularity ? row.TRAFFIC_VOLTE_ERL : row.TRAFFIC_VOLTE_ERL / 1_024,
      rrcUsers: useCellGranularity
        ? row.G4_SUM_MAX_NUMBER_RRC_CONNECTION_USER
        : row.G4_SUM_MAX_NUMBER_RRC_CONNECTION_USER / 1_000,
      availability: (row.AVAILABILITY_NUM / row.AVAILABILITY_DENUM) * 100,
      rrcSetupSR: (row.G4_RRC_SETUP_SR_NUM / row.G4_RRC_SETUP_SR_DENUM) * 100,
      erabSetupSR: (row.G4_ERAB_SETUP_SR_NUM / row.G4_ERAB_SETUP_SR_DENUM) * 100,
      cssr: (row.G4_CSSR_NUM / row.G4_CSSR_DENUM) * 100,
      dropRate: (row.G4_SERVICE_DROP_RATE_NUM / row.G4_SERVICE_DROP_RATE_DENUM) * 100,
      dlPrbUtil: (row.G4_DL_PRB_UTILIZATION_NUM / row.G4_DL_PRB_UTILIZATION_DENUM) * 100,
      ulPrbUtil: (row.G4_UL_PRB_UTILIZATION_NUM / row.G4_UL_PRB_UTILIZATION_DENUM) * 100,
      dlThroughput: row.G4_USER_DL_THP_NUM / row.G4_USER_DL_THP_DENUM / 1_000,
      ulThroughput: row.G4_USER_UL_THP_NUM / row.G4_USER_UL_THP_DENUM / 1_000,
      seBh: row.G4_SE_NUM / row.G4_SE_DENUM,
      avgCQI: row.G4_AVG_CQI_NUM / row.G4_AVG_CQI_DENUM,
      avgNiCarrier: row.G4_AVG_NI_CARRIER_DBM,
      ifhoSR: (row.G4_IFHO_SR_NUM / row.G4_IFHO_SR_DENUM) * 100,
      interfhoSR: (row.G4_INTER_FHO_SR_NUM / row.G4_INTER_FHO_SR_DENUM) * 100,
      csfbSR: (row.G4_CSFB_SETUP_SR_NUM / row.G4_CSFB_SETUP_SR_DENUM) * 100,
      srvccSR: row.G4_SRVCC_E2G_SR_DENUM > 0 ? (row.G4_SRVCC_E2G_SR_NUM / row.G4_SRVCC_E2G_SR_DENUM) * 100 : null,
    };
  });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmt(v: number | null | undefined, dec = 2): string {
  if (v == null) return "N/A";
  return Number(v).toFixed(dec);
}

function fmtDelta(v: number, dec = 2): string {
  // Prefix positive deltas with "+" for clarity in the table
  const fixed = Number(v).toFixed(dec);
  return v > 0 ? `+${fixed}` : fixed;
}

function chartBase(x: number, y: number, w: number, h: number): PptxGenJS.IChartOpts {
  return {
    x,
    y,
    w,
    h,
    chartArea: { fill: { color: THEME.white }, roundedCorners: true },
    catAxisLabelColor: THEME.slate,
    valAxisLabelColor: THEME.slate,
    catAxisLabelFontSize: 7,
    valAxisLabelFontSize: 7,
    valGridLine: { style: "none" },
    catGridLine: { style: "none" },
    showLegend: false,
    lineDataSymbol: "none",
  };
}

// ─── SLIDE BUILDERS ───────────────────────────────────────────────────────────

/**
 * Slide 2 – Comparison Summary Table
 *
 * Columns: Metric | Tech | Before | After | Delta | Growth (%) | Remark
 *
 * Remark color logic (mirrors your UI className rule):
 *   growth > 2 && delta > 0  →  "Good"      green fill
 *   growth > 2 && delta < 0  →  "Degraded"  red fill
 *   otherwise                →  "Stable"    yellow/amber fill
 */
function addComparisonSlide(pres: PptxGenJS, rows: ComparisonRow[]): void {
  const slide = pres.addSlide();
  slide.background = { color: THEME.offWhite };

  // ── Slide title ────────────────────────────────────────────────────────────
  slide.addText("KPI Comparison Summary", {
    x: 0.4,
    y: 0.15,
    w: 9.2,
    h: 0.5,
    fontSize: 22,
    bold: true,
    color: THEME.dark,
    fontFace: FONT.title,
    margin: 0,
  });
  // slide.addText("Before vs After · Delta · Growth · Remark", {
  //   x: 0.4,
  //   y: 0.62,
  //   w: 9.2,
  //   h: 0.28,
  //   fontSize: 10,
  //   color: THEME.slate,
  //   fontFace: FONT.body,
  //   margin: 0,
  // });

  // ── Shared cell styles ─────────────────────────────────────────────────────
  const hStyle: PptxGenJS.TextPropsOptions = {
    fill: { color: THEME.navy },
    color: THEME.white,
    bold: true,
    fontSize: 9,
    align: "center",
    valign: "middle",
  };
  const baseCell: PptxGenJS.TextPropsOptions = {
    fontSize: 9,
    align: "right",
    valign: "middle",
    color: THEME.dark,
  };
  const baseCellCenter: PptxGenJS.TextPropsOptions = {
    ...baseCell,
    align: "center",
  };
  const altFill: PptxGenJS.TextPropsOptions = {
    fill: { color: "F1F5F9" }, // slate-100 stripe
  };

  // ── Header row ─────────────────────────────────────────────────────────────
  const headerRow: PptxGenJS.TableRow = [
    { text: "Metric", options: { ...hStyle, align: "left" } },
    { text: "Tech", options: { ...hStyle, align: "center" } },
    { text: "Before", options: hStyle },
    { text: "After", options: hStyle },
    { text: "Delta", options: hStyle },
    { text: "Growth (%)", options: hStyle },
    { text: "Remark", options: { ...hStyle, align: "center" } },
  ];

  // ── Data rows ──────────────────────────────────────────────────────────────
  const dataRows: PptxGenJS.TableRow[] = rows.map((row, i) => {
    const remark = getRemarkStyle(row);
    const isAlt = i % 2 !== 0;

    // Cells that share the base style (+ optional stripe)
    const cell = (text: string, extra: PptxGenJS.TextPropsOptions = {}): PptxGenJS.TableCell => ({
      text,
      options: {
        ...(isAlt ? altFill : {}),
        ...baseCell,
        ...extra,
      },
    });

    // Delta sign coloring: positive → green text, negative → red text
    const deltaColor = row.delta > 0 ? "059669" : row.delta < 0 ? "DC2626" : THEME.slate;

    return [
      // Metric name – left aligned
      cell(row.metric, { align: "left" }),

      // Tech badge – centered
      cell(row.tech, { align: "center" }),

      // Before
      cell(fmt(row.before, 2)),

      // After
      cell(fmt(row.after, 2)),

      // Delta – signed & colored
      {
        text: fmtDelta(row.delta, 2),
        options: {
          ...(isAlt ? altFill : {}),
          ...baseCell,
          color: deltaColor,
          bold: true,
        },
      },

      // Growth – always show absolute value with 2 dp
      cell(`${fmt(Math.abs(row.growth), 2)}%`, { align: "center" }),

      // Remark – colored fill + text matching the UI rule
      {
        text: remark.label,
        options: {
          ...baseCellCenter,
          fill: { color: remark.fillColor },
          color: remark.textColor,
          bold: true,
        },
      },
    ];
  });

  // ── Render table ───────────────────────────────────────────────────────────
  slide.addTable([headerRow, ...dataRows], {
    x: 0.35,
    y: 0.62,
    w: 9.3,
    // Column widths (must sum to w):  Metric | Tech | Before | After | Delta | Growth | Remark
    colW: [3.1, 0.6, 1.1, 1.1, 1.1, 1.0, 1.2],
    border: { pt: 0.5, color: THEME.slateLight },
    rowH: 0.2,
  });

  // ── Legend ─────────────────────────────────────────────────────────────────
  const legendY = 0.98 + (rows.length + 1) * 0.42 + 0.1; // sits just below the table

  // Only render legend if it fits on the slide (max 5.625" height)
  if (legendY < 5.3) {
    const legendItems: Array<{ fill: string; text: string; textColor: string }> = [
      { fill: "DCFCE7", text: "Improve – growth >2% & delta positive", textColor: "166534" },
      { fill: "FEE2E2", text: "Degrade – growth >2% & delta negative", textColor: "991B1B" },
      { fill: "FEF9C3", text: "Maintain – change within threshold", textColor: "854D0E" },
    ];

    legendItems.forEach((item, i) => {
      const lx = 0.35 + i * 3.1;
      // Color swatch
      slide.addShape(pres.ShapeType.rect, {
        x: lx,
        y: legendY,
        w: 0.18,
        h: 0.18,
        fill: { color: item.fill },
        line: { color: THEME.slateLight, width: 0.5 },
      });
      // Label
      slide.addText(item.text, {
        x: lx + 0.22,
        y: legendY,
        w: 2.8,
        h: 0.18,
        fontSize: 7.5,
        color: item.textColor,
        fontFace: FONT.body,
        margin: 0,
        valign: "middle",
      });
    });
  }
}

/**
 * addSlide_ChartModel1
 * Creates ONE slide per entry in selectedKpis.
 */

function addSlide_ChartModel1(
  pres: PptxGenJS,
  groups: KpiGroup[],
  selectedKpis: string[],
  groupBy: string, // ← add groupBy param
): void {
  const labels = buildUnifiedLabels(groups);
  const chartColors = groups.map((_, idx) => SERIES_COLORS[idx % SERIES_COLORS.length]);

  const pairs: string[][] = [];
  for (let i = 0; i < selectedKpis.length; i += 2) {
    pairs.push(selectedKpis.slice(i, i + 2));
  }

  for (const pair of pairs) {
    const slide = pres.addSlide();
    slide.background = { color: THEME.offWhite };

    pair.forEach((rawKey, col) => {
      const config = KPI_REGISTRY[rawKey as KpiKey];
      if (!config) {
        console.warn(`[reportPerformance] Unknown KPI key: "${rawKey}" – skipping.`);
        return;
      }

      // ── Resolve unit + decimals based on groupBy ──────────────────────────
      const { unit, decimals } = resolveKpiConfig(config, groupBy);

      const GUTTER = 0.1;
      const CHART_W = (9.2 - GUTTER) / 2;
      const x = 0.4 + col * (CHART_W + GUTTER);
      const TITLE_H = 0.42;
      const CHART_Y = 0.15 + TITLE_H;
      const CHART_H = 4.7;

      if (col === 0) {
        const slideTitle = pair.map((k) => KPI_REGISTRY[k as KpiKey]?.title ?? k).join("  ·  ");
        slide.addText(slideTitle, {
          x: 0.4,
          y: 0.1,
          w: 9.2,
          h: TITLE_H,
          fontSize: 13,
          bold: true,
          color: THEME.dark,
          fontFace: FONT.title,
          margin: 0,
        });
      }

      const seriesData = groups.map((group) => ({
        name: group.nop,
        labels,
        values: alignValues(group, labels, config.getValue, decimals),
      }));

      // Chart title now shows correct unit e.g. "Total Payload (GB)" for cell level
      const seriesName = unit ? `${config.title} (${unit})` : config.title;

      const chartOpts: PptxGenJS.IChartOpts = {
        ...chartBase(x, CHART_Y, CHART_W, CHART_H),
        chartColors,
        showTitle: true,
        title: seriesName,
        titleFontSize: 9,
        titleColor: THEME.dark,
        showLegend: true,
        legendPos: "b",
        legendFontSize: 8,
      };

      if (config.chartType === "bar") {
        Object.assign(chartOpts, {
          barDir: "col",
          barGrouping: "clustered",
          showValue: groups.length === 1,
          dataLabelFontSize: 6,
          dataLabelColor: THEME.dark,
          dataLabelPosition: "outEnd",
        } satisfies Partial<PptxGenJS.IChartOpts>);
        slide.addChart((pres as any).charts.BAR, seriesData, chartOpts);
      } else {
        Object.assign(chartOpts, {
          lineSize: 2,
          lineSmooth: true,
        } satisfies Partial<PptxGenJS.IChartOpts>);
        slide.addChart((pres as any).charts.LINE, seriesData, chartOpts);
      }
    });
  }
}

function addPlosSlide(pres: PptxGenJS, dataPlos: RawKpiPlos4G[]): void {
  // ── 1. Extract all rows and group by aggrby ──────────────────────────────
  interface PlosGroup {
    aggrby: string;
    /** sorted unique date labels ("15 Apr", …) */
    byDate: Map<
      string,
      {
        failCount: number;
        packetLoss: number;
        avgDelay: number;
        avgJitter: number;
      }
    >;
  }

  // Extract all rows from all dataPlos entries
  const allRows: PlosRow[] = [];
  for (const entry of dataPlos) {
    if (entry.rows && Array.isArray(entry.rows)) {
      allRows.push(...entry.rows);
    }
  }

  // Group by aggrby
  const groupedByAggrby = new Map<string, PlosRow[]>();
  for (const row of allRows) {
    const aggrby = row.aggrby ?? "Unknown";
    if (!groupedByAggrby.has(aggrby)) {
      groupedByAggrby.set(aggrby, []);
    }
    groupedByAggrby.get(aggrby)?.push(row);
  }

  // Build PlosGroup for each aggrby
  const groups: PlosGroup[] = Array.from(groupedByAggrby.entries()).map(([aggrby, rows]) => {
    const byDate = new Map<string, { failCount: number; packetLoss: number; avgDelay: number; avgJitter: number }>();

    for (const r of rows) {
      const label = new Date(r["Begin Time"]).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
      // Accumulate (sum) if multiple rows share the same date key
      const prev = byDate.get(label) ?? { failCount: 0, packetLoss: 0, avgDelay: 0, avgJitter: 0 };
      byDate.set(label, {
        failCount: prev.failCount + r["FAIL Count"],
        packetLoss: prev.packetLoss + r["Avg Packet Loss Rate"],
        avgDelay: prev.avgDelay + r["Avg Delay"],
        avgJitter: prev.avgJitter + r["Avg Jitter"],
      });
    }

    return { aggrby, byDate };
  });

  // ── 2. Build unified sorted date labels ───────────────────────────────────
  const dateSet = new Set<string>();
  for (const g of groups) {
    for (const d of Array.from(g.byDate.keys())) {
      dateSet.add(d);
    }
  }
  const labels = Array.from(dateSet).sort((a, b) => new Date(`${a} 2026`).getTime() - new Date(`${b} 2026`).getTime());

  // ── 3. Helper: extract aligned value array for a group ────────────────────
  function extractSeries(
    group: PlosGroup,
    field: "failCount" | "packetLoss" | "avgDelay" | "avgJitter",
    dec: number,
  ): number[] {
    return labels.map((lbl) => {
      const v = group.byDate.get(lbl)?.[field] ?? 0;
      const numV = typeof v === "number" ? v : parseFloat(v as string);
      return parseFloat(numV.toFixed(dec));
    });
  }

  // ── 4. Create separate slide for each aggrby ───────────────────────────────
  for (const group of groups) {
    const slide = pres.addSlide();
    slide.background = { color: THEME.offWhite };

    slide.addText(`Packet Loss & Quality - ${group.aggrby}`, {
      x: 0.4,
      y: 0.1,
      w: 9.2,
      h: 0.42,
      fontSize: 16,
      bold: true,
      color: THEME.dark,
      fontFace: FONT.title,
      margin: 0,
    });

    const CHART_Y = 0.6;
    const CHART_H = 4.8;
    const CHART_W = 4.55;
    const GUTTER = 0.3;

    // ── LEFT chart: Combo BAR (Fail Count) + LINE (Packet Loss Rate) ──────────
    const leftComboData: PptxGenJS.IChartMulti[] = [];

    // LINE series: Packet Loss Rate (left / primary Y-axis)
    leftComboData.push({
      type: (pres as any).charts.LINE,
      data: [{ name: `PL Rate - ${group.aggrby}`, labels, values: extractSeries(group, "packetLoss", 4) }],
      options: {
        chartColors: ["0D9488"],
        lineSize: 2,
        lineSmooth: true,
        lineDataSymbol: "none",
        secondaryValAxis: false,
        secondaryCatAxis: false,
      } as PptxGenJS.IChartOpts,
    });

    // BAR series: Fail Count (right / secondary Y-axis)
    leftComboData.push({
      type: (pres as any).charts.BAR,
      data: [{ name: `Fail Cnt - ${group.aggrby}`, labels, values: extractSeries(group, "failCount", 0) }],
      options: {
        chartColors: ["DC2626"],
        barDir: "col",
        barGrouping: "clustered",
        secondaryValAxis: true,
        secondaryCatAxis: true,
      } as PptxGenJS.IChartOpts,
    });

    // Combo charts: first arg is IChartMulti[], layout opts go inside each entry's options.
    // Position/size must be set on the FIRST entry's options (pptxgenjs uses it for placement).
    const comboLayoutOpts: PptxGenJS.IChartOpts = {
      x: 0.4,
      y: CHART_Y,
      w: CHART_W,
      h: CHART_H,
      chartArea: { fill: { color: THEME.white }, roundedCorners: true },

      // Primary (left) axis – Packet Loss Rate
      valAxisTitle: "Packet Loss Rate (%)",
      valAxisTitleFontSize: 8,
      valAxisTitleColor: THEME.slate,
      valAxisLabelColor: THEME.slate,
      valAxisLabelFontSize: 7,

      // Note: Secondary axis properties not supported in this version of pptxgenjs

      catAxisLabelColor: THEME.slate,
      catAxisLabelFontSize: 7,
      valGridLine: { style: "none" },
      catGridLine: { style: "none" },
      showTitle: true,
      title: "Packet Loss Rate (%) vs Fail Count",
      titleFontSize: 9,
      titleColor: THEME.dark,
      showLegend: true,
      legendPos: "b",
      legendFontSize: 7,
      lineDataSymbol: "none",
    };

    // addChart overload for combo: (IChartMulti[], IChartOpts)
    (slide as any).addChart(leftComboData, comboLayoutOpts);

    // ── RIGHT chart: LINE — Avg Delay + Avg Jitter ────────────────────────────
    const delayJitterData: Array<{ name: string; labels: string[]; values: number[] }> = [];

    // Delay series
    delayJitterData.push({
      name: `Delay - ${group.aggrby}`,
      labels,
      values: extractSeries(group, "avgDelay", 2),
    });

    // Jitter series
    delayJitterData.push({
      name: `Jitter - ${group.aggrby}`,
      labels,
      values: extractSeries(group, "avgJitter", 2),
    });

    slide.addChart((pres as any).charts.LINE, delayJitterData, {
      x: 0.4 + CHART_W + GUTTER,
      y: CHART_Y,
      w: CHART_W,
      h: CHART_H,
      chartArea: { fill: { color: THEME.white }, roundedCorners: true },

      chartColors: ["F59E0B", "3B82F6"],
      lineSize: 2,
      lineSmooth: true,
      lineDataSymbol: "none",

      valAxisTitle: "ms",
      valAxisTitleFontSize: 8,
      valAxisTitleColor: THEME.slate,
      valAxisLabelColor: THEME.slate,
      valAxisLabelFontSize: 7,
      catAxisLabelColor: THEME.slate,
      catAxisLabelFontSize: 7,
      valGridLine: { style: "none" },
      catGridLine: { style: "none" },

      showTitle: true,
      title: "Avg Delay & Avg Jitter (ms)",
      titleFontSize: 9,
      titleColor: THEME.dark,
      showLegend: true,
      legendPos: "b",
      legendFontSize: 7,
    } satisfies PptxGenJS.IChartOpts);
  }
}

// ─── MAIN EXPORT FUNCTION ─────────────────────────────────────────────────────

/**
 * reportPerformance
 *
 * Slide order:
 *   1. Cover
 *   2. Comparison Summary Table  ← new (only if filteredComparisonData provided)
 *   3…N. One ChartModel1 slide per selectedKpi
 *   N+1. Radio Quality (fixed)
 *
 * @param filteredData           Raw KPI time-series rows
 * @param fileName               Optional output file name
 * @param selectedKpis           KPI field names → one chart slide each.
 *                               Omit / pass [] to render all registered KPIs.
 * @param filteredComparisonData Before/after comparison rows for the summary table.
 *                               Omit to skip the comparison slide.
 *
 * @example
 * await reportPerformance(
 *   data,
 *   undefined,
 *   ["TOTAL_PAYLOAD_GB", "AVAILABILITY_NUM"],
 *   comparisonRows,
 * );
 */
// ─── UPDATED: reportPerformance — wire everything together ───────────────────

export async function reportPerformance({
  filteredData,
  fileName,
  selectedKpis,
  filteredComparisonData,
  groupBy = "G4_AGGRBY",
  dataPlos,
}: {
  filteredData: RawKpiRow[];
  fileName?: string;
  selectedKpis?: string[];
  filteredComparisonData?: ComparisonRow[];
  groupBy?: string;
  dataPlos?: RawKpiPlos4G[];
}): Promise<void> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_16x9";

  const groups = computeKPIsByNop(filteredData, groupBy);
  const regionLabel = groups.map((g) => g.nop).join(" · ");

  const getUniqueNOPs = (data: Array<{ nop: string }>): string[] =>
    [...new Set(data.map((item) => item.nop.split("_")[0]))].sort();

  const uniqueNOPs = getUniqueNOPs(groups);

  if (filteredComparisonData && filteredComparisonData.length > 0) {
    addComparisonSlide(pres, filteredComparisonData);
  }

  const keysToRender = selectedKpis?.length ? selectedKpis : Object.keys(KPI_REGISTRY);
  addSlide_ChartModel1(pres, groups, keysToRender, groupBy);

  if (dataPlos && dataPlos.length > 0) {
    addPlosSlide(pres, dataPlos);
  }

  const name =
    fileName ??
    `LTE_Report_${groupBy === "G4_SITEID_CELLID" ? uniqueNOPs.join("-") : regionLabel}_${new Date().toISOString().slice(0, 10)}.pptx`;
  await pres.writeFile({ fileName: name });
}

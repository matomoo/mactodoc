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
  G4_AGGRBY: string;
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

// ─── SUPPORTED KPI KEYS (raw field names the caller can pass) ────────────────

export type KpiKey =
  | "TOTAL_PAYLOAD_GB"
  | "DL_PAYLOAD_GB"
  | "UL_PAYLOAD_GB"
  | "TRAFFIC_VOLTE_ERL"
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
  | "G4_AVG_CQI_NUM"
  | "G4_IFHO_SR_NUM"
  | "G4_CSFB_SETUP_SR_NUM"
  | "G4_SRVCC_E2G_SR_NUM";

// ─── COMPUTED KPI TYPES ───────────────────────────────────────────────────────

interface ComputedKpi {
  date: string;
  totalPayloadTB: number;
  dlPayloadGB: number;
  ulPayloadGB: number;
  voltErl: number;
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
  avgCQI: number;
  ifhoSR: number;
  csfbSR: number;
  srvccSR: number | null;
}

interface ClosingStat {
  label: string;
  value: string | number;
}

// ─── KPI REGISTRY ─────────────────────────────────────────────────────────────

interface KpiConfig {
  /** Human-readable slide title */
  title: string;
  /** Chart type rendered in ChartModel1 slides */
  chartType: "line" | "bar";
  /** Unit label appended to the series name in the chart */
  unit: string;
  /** Decimal places used when formatting chart values */
  decimals: number;
  /** Pulls the numeric value out of a ComputedKpi row */
  getValue: (k: ComputedKpi) => number | null;
  /** Hex color (no #) for the chart series */
  color?: string;
}

/**
 * Central registry – maps every raw KPI field name to its display config.
 * Add new entries here; they become selectable slide options automatically.
 */
export const KPI_REGISTRY: Record<KpiKey, KpiConfig> = {
  TOTAL_PAYLOAD_GB: {
    title: "Total Payload",
    chartType: "line",
    unit: "TB",
    decimals: 0,
    getValue: (k) => k.totalPayloadTB,
    color: "0D9488",
  },
  DL_PAYLOAD_GB: {
    title: "Downlink Payload",
    chartType: "line",
    unit: "TB",
    decimals: 2,
    getValue: (k) => k.dlPayloadGB,
    color: "0369A1",
  },
  UL_PAYLOAD_GB: {
    title: "Uplink Payload",
    chartType: "line",
    unit: "TB",
    decimals: 2,
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
    chartType: "bar",
    unit: "%",
    decimals: 4,
    getValue: (k) => k.dropRate,
    color: "DC2626",
  },
  G4_DL_PRB_UTILIZATION_NUM: {
    title: "DL PRB Utilization",
    chartType: "bar",
    unit: "%",
    decimals: 2,
    getValue: (k) => k.dlPrbUtil,
    color: "0D9488",
  },
  G4_UL_PRB_UTILIZATION_NUM: {
    title: "UL PRB Utilization",
    chartType: "bar",
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
  G4_AVG_CQI_NUM: {
    title: "Average CQI",
    chartType: "line",
    unit: "",
    decimals: 2,
    getValue: (k) => k.avgCQI,
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

function computeKPIs(data: RawKpiRow[]): ComputedKpi[] {
  return data.map((row) => {
    const date = new Date(row.BEGIN_TIME).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
    return {
      date,
      totalPayloadTB: row.TOTAL_PAYLOAD_TB,
      dlPayloadGB: row.DL_PAYLOAD_GB / 1_000,
      ulPayloadGB: row.UL_PAYLOAD_GB / 1_000,
      voltErl: row.TRAFFIC_VOLTE_ERL,
      rrcUsers: row.G4_SUM_MAX_NUMBER_RRC_CONNECTION_USER / 1_000_000,
      availability: (row.AVAILABILITY_NUM / row.AVAILABILITY_DENUM) * 100,
      rrcSetupSR: (row.G4_RRC_SETUP_SR_NUM / row.G4_RRC_SETUP_SR_DENUM) * 100,
      erabSetupSR: (row.G4_ERAB_SETUP_SR_NUM / row.G4_ERAB_SETUP_SR_DENUM) * 100,
      cssr: (row.G4_CSSR_NUM / row.G4_CSSR_DENUM) * 100,
      dropRate: (row.G4_SERVICE_DROP_RATE_NUM / row.G4_SERVICE_DROP_RATE_DENUM) * 100,
      dlPrbUtil: (row.G4_DL_PRB_UTILIZATION_NUM / row.G4_DL_PRB_UTILIZATION_DENUM) * 100,
      ulPrbUtil: (row.G4_UL_PRB_UTILIZATION_NUM / row.G4_UL_PRB_UTILIZATION_DENUM) * 100,
      dlThroughput: row.G4_USER_DL_THP_NUM / row.G4_USER_DL_THP_DENUM / 1_000,
      ulThroughput: row.G4_USER_UL_THP_NUM / row.G4_USER_UL_THP_DENUM / 1_000,
      avgCQI: row.G4_AVG_CQI_NUM / row.G4_AVG_CQI_DENUM,
      ifhoSR: (row.G4_IFHO_SR_NUM / row.G4_IFHO_SR_DENUM) * 100,
      csfbSR: (row.G4_CSFB_SETUP_SR_NUM / row.G4_CSFB_SETUP_SR_DENUM) * 100,
      srvccSR: row.G4_SRVCC_E2G_SR_DENUM > 0 ? (row.G4_SRVCC_E2G_SR_NUM / row.G4_SRVCC_E2G_SR_DENUM) * 100 : null,
    };
  });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

function avg(arr: ComputedKpi[], key: keyof ComputedKpi): number {
  return arr.reduce((sum, row) => sum + (row[key] as number), 0) / arr.length;
}

function fmt(v: number | null | undefined, dec = 2): string {
  if (v == null) return "N/A";
  return Number(v).toFixed(dec);
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

function addCoverSlide(pres: PptxGenJS, kpis: ComputedKpi[], region: string): void {
  const slide = pres.addSlide();
  slide.background = { color: THEME.navy };

  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.35,
    h: 5.625,
    fill: { color: THEME.teal },
    line: { color: THEME.teal },
  });
  slide.addText("LTE Network", {
    x: 0.65,
    y: 1.1,
    w: 8.5,
    h: 0.9,
    fontSize: 44,
    bold: true,
    color: THEME.white,
    fontFace: FONT.title,
    margin: 0,
  });
  slide.addText("Performance Report", {
    x: 0.65,
    y: 1.9,
    w: 8.5,
    h: 0.9,
    fontSize: 44,
    bold: true,
    color: THEME.tealLight,
    fontFace: FONT.title,
    margin: 0,
  });
  slide.addText(`Region: ${region}   |   Period: ${kpis[0].date} – ${last(kpis).date}`, {
    x: 0.65,
    y: 3.0,
    w: 8.5,
    h: 0.4,
    fontSize: 13,
    color: THEME.slateLight,
    fontFace: FONT.body,
    margin: 0,
  });
  slide.addText(
    `Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`,
    { x: 0.65, y: 4.9, w: 8.5, h: 0.35, fontSize: 10, color: THEME.slate, fontFace: FONT.body, margin: 0 },
  );
}

/**
 * addSlide_ChartModel1
 *
 * Iterates `selectedKpis` and creates ONE dedicated slide per KPI.
 * Layout per slide:
 *   - Title (KPI name)
 *   - Full-width line or bar chart (driven by KPI_REGISTRY[key].chartType)
 *   - "Remark:" label at the bottom for manual annotation
 *
 * Unknown keys are skipped with a console warning so a bad key
 * never crashes the whole export.
 */
function addSlide_ChartModel1(pres: PptxGenJS, kpis: ComputedKpi[], selectedKpis: string[]): void {
  const labels = kpis.map((k) => k.date);

  for (const rawKey of selectedKpis) {
    // 1. Look up registry config
    const config = KPI_REGISTRY[rawKey as KpiKey];
    if (!config) {
      console.warn(`[reportPerformance] Unknown KPI key: "${rawKey}" – skipping.`);
      continue;
    }

    // 2. Build chart values (null → 0 so the chart always renders)
    const values: number[] = kpis.map((k) => {
      const v = config.getValue(k);
      return parseFloat(fmt(v ?? 0, config.decimals));
    });

    const seriesName = config.unit ? `${config.title} (${config.unit})` : config.title;

    // 3. Build the slide
    const slide = pres.addSlide();
    slide.background = { color: THEME.offWhite };

    // Title
    slide.addText(config.title, {
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

    // Shared chart options
    const chartOpts: PptxGenJS.IChartOpts = {
      ...chartBase(0.4, 0.75, 9.2, 3.2),
      chartColors: [config.color ?? THEME.teal],
      showTitle: true,
      title: seriesName,
      titleFontSize: 10,
      titleColor: THEME.dark,
    };

    // 4. Render chart – bar or line depending on registry config
    if (config.chartType === "bar") {
      Object.assign(chartOpts, {
        barDir: "col",
        showValue: true,
        dataLabelFontSize: 8,
        dataLabelColor: THEME.dark,
        dataLabelPosition: "outEnd",
      } satisfies Partial<PptxGenJS.IChartOpts>);

      slide.addChart((pres as any).charts.BAR, [{ name: seriesName, labels, values }], chartOpts);
    } else {
      Object.assign(chartOpts, {
        lineSize: 2,
        lineSmooth: true,
      } satisfies Partial<PptxGenJS.IChartOpts>);

      slide.addChart((pres as any).charts.LINE, [{ name: seriesName, labels, values }], chartOpts);
    }

    // 5. Remark placeholder
    slide.addText("Remark: ", {
      x: 0.4,
      y: 4.1,
      w: 9.2,
      h: 0.4,
      fontSize: 10,
      color: THEME.slate,
      fontFace: FONT.body,
      margin: 0,
    });
  }
}

function addRadioQualitySlide(pres: PptxGenJS, kpis: ComputedKpi[]): void {
  const slide = pres.addSlide();
  slide.background = { color: THEME.offWhite };

  slide.addText("Radio Quality & Utilization", {
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

  const labels = kpis.map((k) => k.date);

  slide.addChart(
    (pres as any).charts.BAR,
    [
      { name: "DL PRB (%)", labels, values: kpis.map((k) => parseFloat(fmt(k.dlPrbUtil, 2))) },
      { name: "UL PRB (%)", labels, values: kpis.map((k) => parseFloat(fmt(k.ulPrbUtil, 2))) },
    ],
    {
      ...chartBase(0.4, 0.75, 5.5, 2.2),
      barDir: "col",
      barGrouping: "clustered",
      chartColors: [THEME.teal, THEME.accent],
      showLegend: true,
      legendPos: "b",
      legendFontSize: 9,
      showTitle: true,
      title: "DL / UL PRB Utilization (%)",
      titleFontSize: 10,
      titleColor: THEME.dark,
    },
  );

  slide.addChart(
    (pres as any).charts.LINE,
    [{ name: "Avg CQI", labels, values: kpis.map((k) => parseFloat(fmt(k.avgCQI, 2))) }],
    {
      ...chartBase(6.1, 0.75, 3.5, 2.2),
      lineSize: 2,
      lineSmooth: true,
      chartColors: [THEME.accent],
      showTitle: true,
      title: "Average CQI",
      titleFontSize: 10,
      titleColor: THEME.dark,
    },
  );

  slide.addChart(
    (pres as any).charts.LINE,
    [{ name: "DL Tput (Mbps)", labels, values: kpis.map((k) => parseFloat(fmt(k.dlThroughput, 2))) }],
    {
      ...chartBase(0.4, 3.15, 4.5, 2.1),
      lineSize: 2,
      lineSmooth: true,
      chartColors: [THEME.teal],
      showTitle: true,
      title: "DL User Throughput (Mbps)",
      titleFontSize: 10,
      titleColor: THEME.dark,
    },
  );

  slide.addChart(
    (pres as any).charts.LINE,
    [{ name: "UL Tput (Mbps)", labels, values: kpis.map((k) => parseFloat(fmt(k.ulThroughput, 2))) }],
    {
      ...chartBase(5.1, 3.15, 4.5, 2.1),
      lineSize: 2,
      lineSmooth: true,
      chartColors: ["0369A1"],
      showTitle: true,
      title: "UL User Throughput (Mbps)",
      titleFontSize: 10,
      titleColor: THEME.dark,
    },
  );
}

function addClosingSlide(pres: PptxGenJS, kpis: ComputedKpi[]): void {
  const slide = pres.addSlide();
  slide.background = { color: THEME.navyMid };

  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.5,
    fill: { color: THEME.teal },
    line: { color: THEME.teal },
  });
  slide.addText("Report Complete", {
    x: 0.5,
    y: 1.2,
    w: 9,
    h: 0.9,
    fontSize: 38,
    bold: true,
    color: THEME.white,
    fontFace: FONT.title,
    align: "center",
    margin: 0,
  });
  slide.addText(`${kpis[0].date} – ${last(kpis).date}  |  Region: SULAWESI`, {
    x: 0.5,
    y: 2.15,
    w: 9,
    h: 0.4,
    fontSize: 13,
    color: THEME.tealLight,
    fontFace: FONT.body,
    align: "center",
    margin: 0,
  });

  const stats: ClosingStat[] = [
    { label: "Days", value: kpis.length },
    { label: "Avg Payload", value: `${fmt(avg(kpis, "totalPayloadTB"), 0)} TB` },
    { label: "Avg Availability", value: `${fmt(avg(kpis, "availability"), 3)}%` },
    { label: "Avg DL Tput", value: `${fmt(avg(kpis, "dlThroughput"), 2)} Mbps` },
  ];

  stats.forEach((stat, i) => {
    const x = 0.6 + i * 2.2;
    slide.addShape(pres.ShapeType.rect, {
      x,
      y: 3.15,
      w: 2.0,
      h: 1.2,
      fill: { color: "FFFFFF", transparency: 90 },
      line: { color: THEME.teal, width: 1 },
    });
    slide.addText(String(stat.value), {
      x,
      y: 3.22,
      w: 2.0,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: THEME.white,
      fontFace: FONT.title,
      align: "center",
      margin: 0,
    });
    slide.addText(stat.label, {
      x,
      y: 3.82,
      w: 2.0,
      h: 0.4,
      fontSize: 9,
      color: THEME.slateLight,
      fontFace: FONT.body,
      align: "center",
      margin: 0,
    });
  });

  slide.addText("Network Operations | Confidential", {
    x: 0.5,
    y: 5.2,
    w: 9,
    h: 0.25,
    fontSize: 9,
    color: THEME.slate,
    align: "center",
    margin: 0,
  });
}

// ─── MAIN EXPORT FUNCTION ─────────────────────────────────────────────────────

/**
 * reportPerformance
 *
 * @param filteredData   Raw KPI rows from your API / DB
 * @param fileName       Optional output file name (default: auto-generated)
 * @param selectedKpis   Array of raw KPI field names → one slide per entry.
 *                       Must be valid KpiKey values. Unknown keys are skipped.
 *                       Omit (or pass []) to render ALL registered KPIs.
 *
 * @example
 * await reportPerformance(data, undefined, [
 *   "TOTAL_PAYLOAD_GB",
 *   "G4_SUM_MAX_NUMBER_RRC_CONNECTION_USER",
 *   "AVAILABILITY_NUM",
 *   "G4_RRC_SETUP_SR_NUM",
 * ]);
 */
export async function reportPerformance(
  filteredData: RawKpiRow[],
  fileName?: string,
  selectedKpis?: string[],
  filteredComparisonData?: any,
): Promise<void> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pres = new PptxGenJS();

  pres.layout = "LAYOUT_16x9";
  pres.title = "LTE Network Performance Report";
  pres.author = "Network Operations";
  pres.subject = "KPI Report – Sulawesi Region";

  const kpis = computeKPIs(filteredData);
  const region = filteredData[0]?.G4_AGGRBY ?? "SULAWESI";

  // Slide 1 – Cover (always present)
  addCoverSlide(pres, kpis, region);

  // Slides 2…N – One per selected KPI (ChartModel1 layout)
  // Falls back to every registered KPI when selectedKpis is omitted or empty.
  const keysToRender: string[] = selectedKpis && selectedKpis.length > 0 ? selectedKpis : Object.keys(KPI_REGISTRY);

  addSlide_ChartModel1(pres, kpis, keysToRender);

  const name = fileName ?? `LTE_Report_${region}_${new Date().toISOString().slice(0, 10)}.pptx`;

  await pres.writeFile({ fileName: name });
}

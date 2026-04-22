/**
 * generateNetworkReport.ts
 * Next.js client-side PPTX export utility for LTE Network KPI data
 * Usage: import and call generateNetworkReport(filteredData)
 *
 * Dependencies: pptxgenjs
 * Install: npm install pptxgenjs
 * Install types: npm install --save-dev @types/pptxgenjs  (if available, otherwise pptxgenjs ships its own)
 */
/** biome-ignore-all lint/suspicious/noExplicitAny: <none> */

import type PptxGenJS from "pptxgenjs";

// ─── RAW DATA TYPES ───────────────────────────────────────────────────────────

export interface RawKpiRow {
  BEGIN_TIME: string;
  G4_AGGRBY: string;
  G4_SITEID: string;
  G4_SITEID_CELLID: string;
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

interface SummaryCard {
  label: string;
  value: string;
  sub: string;
  color: string;
}

interface ClosingStat {
  label: string;
  value: string | number;
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
  gridLine: "E2E8F0",
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
      dlPayloadGB: row.DL_PAYLOAD_GB / 1_000, // → TB
      ulPayloadGB: row.UL_PAYLOAD_GB / 1_000, // → TB
      voltErl: row.TRAFFIC_VOLTE_ERL,
      rrcUsers: row.G4_SUM_MAX_NUMBER_RRC_CONNECTION_USER / 1_000_000, // → M
      availability: (row.AVAILABILITY_NUM / row.AVAILABILITY_DENUM) * 100,
      rrcSetupSR: (row.G4_RRC_SETUP_SR_NUM / row.G4_RRC_SETUP_SR_DENUM) * 100,
      erabSetupSR: (row.G4_ERAB_SETUP_SR_NUM / row.G4_ERAB_SETUP_SR_DENUM) * 100,
      cssr: (row.G4_CSSR_NUM / row.G4_CSSR_DENUM) * 100,
      dropRate: (row.G4_SERVICE_DROP_RATE_NUM / row.G4_SERVICE_DROP_RATE_DENUM) * 100,
      dlPrbUtil: (row.G4_DL_PRB_UTILIZATION_NUM / row.G4_DL_PRB_UTILIZATION_DENUM) * 100,
      ulPrbUtil: (row.G4_UL_PRB_UTILIZATION_NUM / row.G4_UL_PRB_UTILIZATION_DENUM) * 100,
      dlThroughput: row.G4_USER_DL_THP_NUM / row.G4_USER_DL_THP_DENUM / 1_000, // kbps → Mbps
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
    chartColors: ["1D4ED8", "7C3AED"],
    catAxisLabelColor: THEME.slate,
    valAxisLabelColor: THEME.slate,
    catAxisLabelFontSize: 7,
    valAxisLabelFontSize: 7,
    // valGridLine: { color: THEME.gridLine, size: 0.5 },
    valGridLine: { style: "none" },
    catGridLine: { style: "none" },
    showLegend: false,
    lineDataSymbol: "none",
  };
}

// ─── SLIDE BUILDERS ───────────────────────────────────────────────────────────

/** Slide 1 – Cover */
function addCoverSlide(pres: PptxGenJS, kpis: ComputedKpi[], region: string): void {
  const slide = pres.addSlide();
  slide.background = { color: THEME.navy };

  // Left accent bar
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

  const dateRange = `${kpis[0].date} – ${last(kpis).date}`;
  slide.addText(`Region: ${region}   |   Period: ${dateRange}`, {
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
    `Generated: ${new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
    {
      x: 0.65,
      y: 4.9,
      w: 8.5,
      h: 0.35,
      fontSize: 10,
      color: THEME.slate,
      fontFace: FONT.body,
      margin: 0,
    },
  );
}

/** Slide 2 – KPI Summary Cards */
function addSummarySlide(pres: PptxGenJS, kpis: ComputedKpi[]): void {
  const slide = pres.addSlide();
  slide.background = { color: THEME.offWhite };

  slide.addText("KPI Summary", {
    x: 0.4,
    y: 0.2,
    w: 9.2,
    h: 0.55,
    fontSize: 26,
    bold: true,
    color: THEME.dark,
    fontFace: FONT.title,
    margin: 0,
  });
  slide.addText(`Latest: ${last(kpis).date}  |  7-Day Average`, {
    x: 0.4,
    y: 0.72,
    w: 9.2,
    h: 0.3,
    fontSize: 11,
    color: THEME.slate,
    fontFace: FONT.body,
    margin: 0,
  });

  const cards: SummaryCard[] = [
    {
      label: "Avg Payload",
      value: `${fmt(avg(kpis, "totalPayloadTB"), 0)} TB`,
      sub: `Latest: ${fmt(last(kpis).totalPayloadTB, 0)} TB`,
      color: THEME.teal,
    },
    {
      label: "Availability",
      value: `${fmt(avg(kpis, "availability"), 3)}%`,
      sub: `Latest: ${fmt(last(kpis).availability, 3)}%`,
      color: "1D4ED8",
    },
    {
      label: "RRC Setup SR",
      value: `${fmt(avg(kpis, "rrcSetupSR"), 3)}%`,
      sub: `Latest: ${fmt(last(kpis).rrcSetupSR, 3)}%`,
      color: "7C3AED",
    },
    {
      label: "ERAB Setup SR",
      value: `${fmt(avg(kpis, "erabSetupSR"), 3)}%`,
      sub: `Latest: ${fmt(last(kpis).erabSetupSR, 3)}%`,
      color: "059669",
    },
    {
      label: "Drop Rate",
      value: `${fmt(avg(kpis, "dropRate"), 4)}%`,
      sub: `Latest: ${fmt(last(kpis).dropRate, 4)}%`,
      color: "DC2626",
    },
    {
      label: "DL Throughput",
      value: `${fmt(avg(kpis, "dlThroughput"), 2)} Mbps`,
      sub: `Latest: ${fmt(last(kpis).dlThroughput, 2)} Mbps`,
      color: THEME.teal,
    },
    {
      label: "UL Throughput",
      value: `${fmt(avg(kpis, "ulThroughput"), 2)} Mbps`,
      sub: `Latest: ${fmt(last(kpis).ulThroughput, 2)} Mbps`,
      color: "0369A1",
    },
    {
      label: "Avg CQI",
      value: fmt(avg(kpis, "avgCQI"), 2),
      sub: `Latest: ${fmt(last(kpis).avgCQI, 2)}`,
      color: THEME.accent,
    },
  ];

  const cols = 4;
  const cW = 2.2;
  const cH = 1.1;
  const gap = 0.08;
  const startX = 0.35;
  const startY = 1.15;

  cards.forEach((card, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cW + gap);
    const y = startY + row * (cH + gap);

    slide.addShape(pres.ShapeType.rect, {
      x,
      y,
      w: cW,
      h: cH,
      fill: { color: THEME.white },
      line: { color: THEME.slateLight, width: 0.5 },
      shadow: { type: "outer", color: "000000", blur: 5, offset: 2, angle: 135, opacity: 0.08 },
    });
    slide.addShape(pres.ShapeType.rect, {
      x,
      y,
      w: cW,
      h: 0.07,
      fill: { color: card.color },
      line: { color: card.color },
    });
    slide.addText(card.label, {
      x: x + 0.12,
      y: y + 0.1,
      w: cW - 0.24,
      h: 0.22,
      fontSize: 9,
      color: THEME.slate,
      fontFace: FONT.body,
      margin: 0,
    });
    slide.addText(card.value, {
      x: x + 0.12,
      y: y + 0.3,
      w: cW - 0.24,
      h: 0.42,
      fontSize: 20,
      bold: true,
      color: THEME.dark,
      fontFace: FONT.title,
      margin: 0,
    });
    slide.addText(card.sub, {
      x: x + 0.12,
      y: y + 0.78,
      w: cW - 0.24,
      h: 0.22,
      fontSize: 8,
      color: THEME.slate,
      fontFace: FONT.body,
      margin: 0,
      italic: true,
    });
  });
}

/** Slide 3 – Traffic & Payload */
function addTrafficSlide(pres: PptxGenJS, kpis: ComputedKpi[]): void {
  const slide = pres.addSlide();
  slide.background = { color: THEME.offWhite };

  slide.addText("Traffic & Payload", {
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
      { name: "DL (TB)", labels, values: kpis.map((k) => parseFloat(fmt(k.dlPayloadGB, 2))) },
      { name: "UL (TB)", labels, values: kpis.map((k) => parseFloat(fmt(k.ulPayloadGB, 2))) },
    ],
    {
      ...chartBase(0.4, 0.75, 5.8, 3.8),
      barDir: "col",
      barGrouping: "stacked",
      //   chartColors: [THEME.teal, THEME.accent],
      showLegend: true,
      legendPos: "b",
      legendFontSize: 9,
      showTitle: true,
      title: "DL + UL Daily Payload (TB)",
      titleFontSize: 11,
      titleColor: THEME.dark,
      showValue: false,
    },
  );

  slide.addChart(
    (pres as any).charts.LINE,
    [{ name: "VoLTE (Erl)", labels, values: kpis.map((k) => parseFloat(fmt(k.voltErl, 0))) }],
    {
      ...chartBase(6.4, 0.75, 3.2, 1.7),
      lineSize: 2,
      lineSmooth: true,
      showTitle: true,
      title: "VoLTE Traffic (Erl)",
      titleFontSize: 10,
      titleColor: THEME.dark,
    },
  );

  slide.addChart(
    (pres as any).charts.LINE,
    [{ name: "RRC Users (M)", labels, values: kpis.map((k) => parseFloat(fmt(k.rrcUsers, 3))) }],
    {
      ...chartBase(6.4, 2.65, 3.2, 1.85),
      lineSize: 2,
      lineSmooth: true,
      showTitle: true,
      title: "Max RRC Users (M)",
      titleFontSize: 10,
      titleColor: THEME.dark,
    },
  );
}

/** Slide 4 – Accessibility KPIs */
function addAccessibilitySlide(pres: PptxGenJS, kpis: ComputedKpi[]): void {
  const slide = pres.addSlide();
  slide.background = { color: THEME.offWhite };

  slide.addText("Accessibility KPIs", {
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
    (pres as any).charts.LINE,
    [{ name: "Availability (%)", labels, values: kpis.map((k) => parseFloat(fmt(k.availability, 4))) }],
    {
      ...chartBase(0.4, 0.75, 4.5, 2.1),
      lineSize: 2,
      lineSmooth: true,
      showTitle: true,
      title: "Network Availability (%)",
      titleFontSize: 10,
      titleColor: THEME.dark,
      valAxisMinVal: 99,
    },
  );

  slide.addChart(
    (pres as any).charts.LINE,
    [{ name: "RRC SR (%)", labels, values: kpis.map((k) => parseFloat(fmt(k.rrcSetupSR, 4))) }],
    {
      ...chartBase(5.1, 0.75, 4.5, 2.1),
      lineSize: 2,
      lineSmooth: true,
      showTitle: true,
      title: "RRC Setup Success Rate (%)",
      titleFontSize: 10,
      titleColor: THEME.dark,
    },
  );

  slide.addChart(
    (pres as any).charts.LINE,
    [{ name: "ERAB SR (%)", labels, values: kpis.map((k) => parseFloat(fmt(k.erabSetupSR, 4))) }],
    {
      ...chartBase(0.4, 3.1, 4.5, 2.1),
      lineSize: 2,
      lineSmooth: true,
      showTitle: true,
      title: "ERAB Setup Success Rate (%)",
      titleFontSize: 10,
      titleColor: THEME.dark,
    },
  );

  slide.addChart(
    (pres as any).charts.LINE,
    [{ name: "CSSR (%)", labels, values: kpis.map((k) => parseFloat(fmt(k.cssr, 4))) }],
    {
      ...chartBase(5.1, 3.1, 4.5, 2.1),
      lineSize: 2,
      lineSmooth: true,
      showTitle: true,
      title: "Call Setup Success Rate - CSSR (%)",
      titleFontSize: 10,
      titleColor: THEME.dark,
    },
  );
}

/** Slide 5 – Retainability & Handover */
function addRetainabilitySlide(pres: PptxGenJS, kpis: ComputedKpi[]): void {
  const slide = pres.addSlide();
  slide.background = { color: THEME.offWhite };

  slide.addText("Retainability & Handover", {
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
    [{ name: "Drop Rate (%)", labels, values: kpis.map((k) => parseFloat(fmt(k.dropRate, 4))) }],
    {
      ...chartBase(0.4, 0.75, 4.5, 2.1),
      barDir: "col",
      showTitle: true,
      title: "Service Drop Rate (%)",
      titleFontSize: 10,
      titleColor: THEME.dark,
      showValue: true,
      dataLabelFontSize: 8,
      dataLabelColor: THEME.dark,
      dataLabelPosition: "outEnd",
    },
  );

  slide.addChart(
    (pres as any).charts.LINE,
    [{ name: "IFHO SR (%)", labels, values: kpis.map((k) => parseFloat(fmt(k.ifhoSR, 3))) }],
    {
      ...chartBase(5.1, 0.75, 4.5, 2.1),
      lineSize: 2,
      lineSmooth: true,
      showTitle: true,
      title: "Intra-Freq Handover SR (%)",
      titleFontSize: 10,
      titleColor: THEME.dark,
    },
  );

  slide.addChart(
    (pres as any).charts.LINE,
    [{ name: "CSFB SR (%)", labels, values: kpis.map((k) => parseFloat(fmt(k.csfbSR, 3))) }],
    {
      ...chartBase(0.4, 3.1, 4.5, 2.1),
      lineSize: 2,
      lineSmooth: true,
      showTitle: true,
      title: "CSFB Setup Success Rate (%)",
      titleFontSize: 10,
      titleColor: THEME.dark,
    },
  );

  const srvccKpis = kpis.filter((k): k is ComputedKpi & { srvccSR: number } => k.srvccSR != null);
  slide.addChart(
    (pres as any).charts.LINE,
    [
      {
        name: "SRVCC SR (%)",
        labels: srvccKpis.map((k) => k.date),
        values: srvccKpis.map((k) => parseFloat(fmt(k.srvccSR, 3))),
      },
    ],
    {
      ...chartBase(5.1, 3.1, 4.5, 2.1),
      lineSize: 2,
      lineSmooth: true,
      showTitle: true,
      title: "SRVCC E2G Success Rate (%)",
      titleFontSize: 10,
      titleColor: THEME.dark,
    },
  );
}

/** Slide 6 – Radio Quality & Utilization */
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
      showTitle: true,
      title: "UL User Throughput (Mbps)",
      titleFontSize: 10,
      titleColor: THEME.dark,
    },
  );
}

/** Slide 7 – Data Table */
function addTableSlide(pres: PptxGenJS, kpis: ComputedKpi[]): void {
  const slide = pres.addSlide();
  slide.background = { color: THEME.offWhite };

  slide.addText("Daily KPI Data Table", {
    x: 0.4,
    y: 0.15,
    w: 9.2,
    h: 0.45,
    fontSize: 20,
    bold: true,
    color: THEME.dark,
    fontFace: FONT.title,
    margin: 0,
  });

  const headerStyle: PptxGenJS.TextPropsOptions = {
    fill: { color: THEME.navy },
    color: THEME.white,
    bold: true,
    fontSize: 8,
    align: "center",
  };
  const cellStyle: PptxGenJS.TextPropsOptions = {
    fontSize: 8,
    align: "center",
    color: THEME.dark,
  };
  const altStyle: PptxGenJS.TextPropsOptions = {
    fontSize: 8,
    align: "center",
    color: THEME.dark,
    fill: { color: "F1F5F9" },
  };

  const headers: PptxGenJS.TableRow[] = [
    [
      { text: "Date", options: headerStyle },
      { text: "Payload (TB)", options: headerStyle },
      { text: "Availability (%)", options: headerStyle },
      { text: "RRC SR (%)", options: headerStyle },
      { text: "ERAB SR (%)", options: headerStyle },
      { text: "Drop Rate (%)", options: headerStyle },
      { text: "DL Tput (Mbps)", options: headerStyle },
      { text: "UL Tput (Mbps)", options: headerStyle },
      { text: "CQI", options: headerStyle },
    ],
  ];

  const dataRows: PptxGenJS.TableRow[] = kpis.map((k, i) => {
    const s = i % 2 === 0 ? cellStyle : altStyle;
    return [
      { text: k.date, options: s },
      { text: fmt(k.totalPayloadTB, 0), options: s },
      { text: fmt(k.availability, 3), options: s },
      { text: fmt(k.rrcSetupSR, 3), options: s },
      { text: fmt(k.erabSetupSR, 3), options: s },
      { text: fmt(k.dropRate, 4), options: { ...s, color: "DC2626", bold: true } },
      { text: fmt(k.dlThroughput, 2), options: s },
      { text: fmt(k.ulThroughput, 2), options: s },
      { text: fmt(k.avgCQI, 2), options: s },
    ];
  });

  slide.addTable([...headers, ...dataRows], {
    x: 0.35,
    y: 0.72,
    w: 9.3,
    colW: [0.8, 0.9, 1.15, 0.9, 0.9, 0.95, 1.15, 1.15, 0.91],
    border: { pt: 0.5, color: THEME.slateLight },
    rowH: 0.32,
  });
}

/** Slide 8 – Closing */
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
 * generateNetworkReport
 * @param filteredData  Raw KPI rows from your API/DB
 * @param fileName      Optional output file name (default: auto-generated)
 * @returns             Promise that resolves after the browser download starts
 */
export async function generateNetworkReport(filteredData: RawKpiRow[], fileName?: string): Promise<void> {
  // Lazy-load to avoid SSR issues and keep initial bundle lean
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pres = new PptxGenJS();

  pres.layout = "LAYOUT_16x9";
  pres.title = "LTE Network Performance Report";
  pres.author = "Network Operations";
  pres.subject = "KPI Report – Sulawesi Region";

  const kpis = computeKPIs(filteredData);
  const region = filteredData[0]?.G4_AGGRBY ?? "SULAWESI";

  addCoverSlide(pres, kpis, region);
  addSummarySlide(pres, kpis);
  addTrafficSlide(pres, kpis);
  addAccessibilitySlide(pres, kpis);
  addRetainabilitySlide(pres, kpis);
  addRadioQualitySlide(pres, kpis);
  addTableSlide(pres, kpis);
  addClosingSlide(pres, kpis);

  const name = fileName ?? `LTE_Report_${region}_${new Date().toISOString().slice(0, 10)}.pptx`;

  await pres.writeFile({ fileName: name });
}

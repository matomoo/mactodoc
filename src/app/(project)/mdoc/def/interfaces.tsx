export interface SqacTrackerItem {
  id: string;
  user_id: string;
  wid: string;
  site: string;
  band: string;
  connected: string | null;
  audit: string | null;
  dt: string | null;
  sqac_status: string;
  sqac_remark: string;
  created_at: string;
  type_of_work: string;
  tac: string;
  city: string;
  band_impact: string;
}

export interface DataKpiStatistic4g {
  kpi_index: number;
  kpi_name: string;
  unit: string;
  day1_val: string;
  day2_val: string;
  day3_val: string;
  average: string;
  target: string;
  delta: string;
  growth_val: string;
  growth_dir: string;
  remark: string;
  "RRC Est Success Rate (%)": string;
  Band: string;
  BandCity: string;
  "CQI Average": string;
  "CSFB (%)": string;
  "Call Setup Success Rate (%)": string;
  City: string;
  "E-RAB Drop Rate (%)": string;
  "E-RAB Success Rate (%)": string;
  "Intra Freq LTE HO (%)": string;
  "Inter Freq LTE HO (%)": string;
  SE2: string;
  "Uplink RSSI (dBm)": string;
}

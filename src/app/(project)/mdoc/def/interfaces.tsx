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
  siteid: string;
  band_4g_sow: string;
  band_2g_sow: string;
  site_name_4g: string;
  enodeb_id: string;
  cell_id_4g: string;
  site_name_2g: string;
  site_no_2g: string;
  lac_2g: string;
  cell_id_2g: string;
  latitude: string;
  longitude: string;
  kabupaten: string;
  trx_configuration: string;
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
  "DCR (%)": string;
  "HOSR (%)": string;
  "ICM BAND (0-5)": string;
  "SDSR (%)": string;
  "TBF COMPLETION SR (%)": string;
  "TBF DL EST SR (%)": string;
  "TBF UL EST SR (%)": string;
  Date: string;
  Calendar_Day: string;
  "Utilization (%)": string;
  "BH Traffic (Erl)": string;
  "Payload (MB)": string;
  sort: number;
  "Site Avail (%)": number;
  "EDGE DL Payload (GByte)": string;
  "EDGE UL Payload (GByte)": string;
  "Day-1 Before": string;
  "Day-2 Before": string;
  "Day-3 Before": string;
  "Day-1 After": string;
  "Day-2 After": string;
  "Day-3 After": string;
  "Average Before": string;
  "Average After": string;
  KPI: string;
  Growth: string;
  Result: string;
  begin_time: string;
  sector: string;
  band: string;
  payload_gb: string;
  max_cell_pdcp_thp_mbps: string;
  max_rrc_con_user_number: string;
  rrc_conn: string;
  dl_util: string;
  group_by: string;
  traffic_erl: number;
  productivity_val: number;
  "Site ID": string;
  Sector: string;
  "Band Combination": string;
  L900: string;
  L1800: string;
  L2100: string;
  L2300: string;
  "Max PRB": string;
  "Min PRB": string;
  "Gap L900": string;
  "Gap L1800": string;
  "Gap L2100": string;
  "Gap L2300": string;
  "Max GAP PRB": string;
  filter_by: string;
  tanggal: string;
  siteid: string;
  deskripsi: string;
  availability: string;
  rrc_setup: string;
  erab_setup: string;
  cssr: string;
  erab_drop: string;
  ifho: string;
  csfb: string;
  cqi_average: string;
  se2: string;
  number_csfb: string;
  payload_ca: string;
  sdsr: string;
  hosr: string;
  dcr: string;
  tbf_dl: string;
  tbf_comp: string;
  fast_return_lte: string;
}

export interface DataPayloadThpUser {
  begin_time: string;
  sector: string;
  payload_gb: number;
  max_cell_pdcp_thp_mbps: number;
  max_rrc_con_user_number: number;
}

export interface DataPayloadBandSiteSow {
  begin_time: string;
  band: string;
  payload_gb: number;
  total_payload_gb: number;
  group_by: string;
  rrc_conn: string;
  dl_util: string;
  productivity_val: number;
}

export interface DataActivityLog {
  tanggal: string;
  siteid: string;
  band: string;
  deskripsi: string;
}

export interface TaDataItem {
  siteid: string;
  band: string;
  siteid_short_band_sector: string;
  cellId: number;
  sector: string;
  ta_range: string;
  sort_order: number;
  total_reports: number;
  percentage: string;
}

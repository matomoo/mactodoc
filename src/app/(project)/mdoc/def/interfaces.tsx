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

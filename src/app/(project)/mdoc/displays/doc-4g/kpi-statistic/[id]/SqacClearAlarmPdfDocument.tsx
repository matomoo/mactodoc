import type { DataActivityLog, SqacFirstTierItem, TaDataItem } from "@/app/(project)/mdoc/def/interfaces";

import { SqacClearAlarmPdfPage } from "./SqacClearAlarmPdfPage";

interface SqacTrackerItem {
  id?: string;
  site?: string | null;
  band?: string | null;
  site_name?: string | null;
  enodeb_id?: string | null;
  type_of_work?: string | null;
  tac?: string | null;
  city?: string | null;
  cell_id?: string | null;
  band_impact?: string | null;
  connected?: string | null;
  dt?: string | null;
}

interface Props {
  data: SqacTrackerItem[];
  dataActivity: DataActivityLog[];
  dataTa4g: TaDataItem[];
  dataGetSqacFirstTier: SqacFirstTierItem[];
  dataGetTa4GTier: TaDataItem[];
  wid: string;
}

export default function SqacClearAlarmPdfDocument({
  data,
  wid,
  dataActivity,
  dataTa4g,
  dataGetSqacFirstTier,
  dataGetTa4GTier,
}: Props) {
  return (
    <>
      {data.map((item) => (
        <SqacClearAlarmPdfPage
          key={item.id || wid}
          item={item}
          wid={wid}
          dataActivity={dataActivity}
          dataTa4g={dataTa4g}
          dataGetSqacFirstTier={dataGetSqacFirstTier}
          dataGetTa4GTier={dataGetTa4GTier}
        />
      ))}
    </>
  );
}

import { Document } from "@react-pdf/renderer";

import type { DataActivityLog } from "@/app/(project)/mdoc/def/interfaces";

import { SqacKpiPdfPage } from "./SqacKpiPdfPage";

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
  wid: string;
  baseUrl?: string;
}

export default function SqacKpiPdfDocument({ data, wid, dataActivity, baseUrl }: Props) {
  return (
    <>
      {data.map((item) => (
        <SqacKpiPdfPage key={item.id || wid} item={item} wid={wid} dataActivity={dataActivity} baseUrl={baseUrl} />
      ))}
    </>
  );
}

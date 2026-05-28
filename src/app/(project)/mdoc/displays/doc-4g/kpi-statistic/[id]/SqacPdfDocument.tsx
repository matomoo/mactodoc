import { Document } from "@react-pdf/renderer";

import { SqacPdfPage } from "./SqacPdfPage";

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
  wid: string;
}

export default function SqacPdfDocument({ data, wid }: Props) {
  return (
    <Document>
      {data.map((item) => (
        <SqacPdfPage key={item.id || wid} item={item} wid={wid} />
      ))}
    </Document>
  );
}

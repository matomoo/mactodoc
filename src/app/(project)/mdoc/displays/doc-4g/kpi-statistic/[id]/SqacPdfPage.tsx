import { Document, Image, Page, Path, Rect, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";

const LOGO_TINFRA = "/images/logo/logo-tinfra.png";
const LOGO_TELKOMSEL = "/images/logo/logo-telkomsel.png";

export interface SqacPdfPageProps {
  item: {
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
  };
  wid: string;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function formatValue(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") return "---";
  return value;
}

export function SqacPdfPage({ item, wid }: SqacPdfPageProps) {
  const CheckedBox = () => (
    <View style={{ width: 12, height: 12, marginRight: 5 }}>
      <Svg viewBox="0 0 24 24">
        {/* Outer Box */}
        <Rect x="2" y="2" width="20" height="20" stroke="black" strokeWidth="2" fill="none" />
        {/* Checkmark */}
        <Path d="M6 12l4 4 8-8" stroke="black" strokeWidth="3" fill="none" />
      </Svg>
    </View>
  );

  const today: string = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      {/* Page 1 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>SITE QUALITY ACCEPTANCE CERTIFICATE</Text>

        <Text style={styles.subHeader}>SITEID-PDID: {formatValue(wid)}</Text>

        {/* Row 1 */}
        <View style={styles.row}>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>Site ID</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.site)}</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>Band SOW</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellRight, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.band)}</Text>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>Site Name</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.site_name)}</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>eNodeB ID</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellRight, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.enodeb_id)}</Text>
          </View>
        </View>

        {/* Row 3 */}
        <View style={styles.row}>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>Type Of Work</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.type_of_work)}</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>TAC</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellRight, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.tac)}</Text>
          </View>
        </View>

        {/* Row 4 */}
        <View style={styles.row}>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>City</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.city)}</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>Cell ID</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellRight, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.cell_id)}</Text>
          </View>
        </View>

        {/* Row 5 */}
        <View style={styles.row}>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellBottom, styles.cellLabel, styles.w37]}>
            <Text>Band Impact</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellValue, styles.cellBottom, styles.w62]}>
            <Text>{formatValue(item.band_impact)}</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellBottom, styles.cellLabel, styles.w37]}>
            <Text />
          </View>
          <View
            style={[styles.cellTop, styles.cellLeft, styles.cellRight, styles.cellBottom, styles.cellValue, styles.w62]}
          >
            <Text />
          </View>
        </View>

        {/* Integration Date Row */}
        <View style={[styles.row, { marginTop: 8, marginBottom: 8 }]}>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellBottom, styles.cellLabel, styles.w37]}>
            <Text>Integration Date</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellBottom, styles.cellValue, styles.w32]}>
            <Text>{formatDate(item.connected)}</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellBottom, styles.cellLabel, styles.w37]}>
            <Text>On Air Date</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellBottom, styles.cellValue, styles.w32]}>
            <Text>{formatDate(item.connected)}</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellBottom, styles.cellLabel, styles.w37]}>
            <Text>Acceptance Date</Text>
          </View>
          <View
            style={[styles.cellTop, styles.cellLeft, styles.cellRight, styles.cellBottom, styles.cellValue, styles.w32]}
          >
            <Text>{formatDate(item.dt)}</Text>
          </View>
        </View>

        <Text style={[styles.paragraphNormal, { marginTop: 16, marginBottom: 16 }]}>
          This quality certificate is a legal note that Telkomsel's SQA department in regional office has approved the
          integration quality of mentioned type of work to the Telkomsel network and accepting reached KPI integration
          values.
        </Text>

        <Text style={[styles.paragraphNormal, { marginBottom: 16 }]}>
          The quality certificate is printed in three identical copies and its content is approved by Telkominfra
          Project, Telkomsel SQA in regional office.
        </Text>

        <View style={[styles.checkboxRow, { marginLeft: 32 }]}>
          <CheckedBox />
          <Text style={styles.paragraphNormal}>KPI Statistical</Text>
        </View>
        <View style={[styles.checkboxRow, { marginLeft: 32 }]}>
          <CheckedBox />
          <Text style={styles.paragraphNormal}>Free Alarm</Text>
        </View>
        <View style={[styles.checkboxRow, { marginLeft: 32 }]}>
          <CheckedBox />
          <Text style={styles.paragraphNormal}>Drive Test</Text>
        </View>

        <Text style={[styles.paragraphNormal, { marginTop: 16, marginBottom: 24 }]}>Note:</Text>
        <Text style={[styles.paragraphNormal, { marginBottom: 4 }]}>QC Submission Date:</Text>
        <Text style={[styles.paragraphNormal, { marginBottom: 16 }]}>QC Review Date:</Text>
        <Text style={[styles.paragraphNormal, { marginBottom: 16 }]}>
          Reason of Review Delay : __________________________________________________________________
        </Text>

        <View style={styles.row}>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellValue, styles.w62]}>
            <Text>Manager SQA Telkomsel</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellValue, styles.w62]}>
            <Text>RANQ Escalation</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellRight, styles.cellValue, styles.w62]}>
            <Text>Telkominfra</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellValue,
              styles.w32,
              { textAlign: "left", fontSize: 8.5 },
            ]}
          >
            <Text>Approved By:</Text>
          </View>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellValue,
              styles.w32,
              { textAlign: "left", fontSize: 8.5 },
            ]}
          >
            <Text>Andrisyal</Text>
          </View>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellValue,
              styles.w32,
              { textAlign: "left", fontSize: 8.5 },
            ]}
          >
            <Text>Approved By:</Text>
          </View>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellValue,
              styles.w32,
              { textAlign: "left", fontSize: 8.5 },
            ]}
          >
            <Text>{""}</Text>
          </View>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellValue,
              styles.w32,
              { textAlign: "left", fontSize: 8.5 },
            ]}
          >
            <Text>Originator:</Text>
          </View>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellRight,
              styles.cellValue,
              styles.w32,
              { textAlign: "left", fontSize: 8.5 },
            ]}
          >
            <Text>Andi Zahuriansyah</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellValue,
              styles.w32,
              { textAlign: "left", fontSize: 8.5 },
            ]}
          >
            <Text>Date:</Text>
          </View>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellValue,
              styles.w32,
              { textAlign: "left", fontSize: 8.5 },
            ]}
          >
            <Text>{""}</Text>
          </View>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellValue,
              styles.w32,
              { textAlign: "left", fontSize: 8.5 },
            ]}
          >
            <Text>Date:</Text>
          </View>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellValue,
              styles.w32,
              { textAlign: "left", fontSize: 8.5 },
            ]}
          >
            <Text>{""}</Text>
          </View>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellValue,
              styles.w32,
              { textAlign: "left", fontSize: 8.5 },
            ]}
          >
            <Text>Date:</Text>
          </View>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellRight,
              styles.cellValue,
              styles.w32,
              { textAlign: "left", fontSize: 8.5 },
            ]}
          >
            <Text>{""}</Text>
          </View>
        </View>

        <View style={[styles.row, { lineHeight: 4 }]}>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellBottom,
              styles.cellValue,
              styles.w62,
              { textAlign: "left" },
            ]}
          >
            <Text>Signature:</Text>
          </View>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellBottom,
              styles.cellValue,
              styles.w62,
              { textAlign: "left" },
            ]}
          >
            <Text>Signature:</Text>
          </View>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellRight,
              styles.cellBottom,
              styles.cellValue,
              styles.w62,
              { textAlign: "left" },
            ]}
          >
            <Text>Signature:</Text>
          </View>
        </View>

        <View style={[styles.row, { marginTop: 8 }]}>
          <View style={[styles.col, styles.w62]}>
            <View style={[styles.row]}>
              <View
                style={[
                  styles.cellTop,
                  styles.cellLeft,
                  styles.cellValue,
                  { width: "40%", textAlign: "left", fontSize: 8.5 },
                ]}
              >
                <Text>Company:</Text>
              </View>
              <View
                style={[
                  styles.cellTop,
                  styles.cellLeft,
                  styles.cellValue,
                  { width: "60%", textAlign: "left", fontSize: 8.5 },
                ]}
              >
                <Text>Telkominfra</Text>
              </View>
            </View>
            <View style={[styles.row]}>
              <View
                style={[
                  styles.cellTop,
                  styles.cellLeft,
                  styles.cellValue,
                  { width: "40%", textAlign: "left", fontSize: 8.5 },
                ]}
              >
                <Text>Prepare By:</Text>
              </View>
              <View
                style={[
                  styles.cellTop,
                  styles.cellLeft,
                  styles.cellValue,
                  { width: "60%", textAlign: "left", fontSize: 8.5 },
                ]}
              >
                <Text>ISM</Text>
              </View>
            </View>
            <View style={[styles.row]}>
              <View
                style={[
                  styles.cellTop,
                  styles.cellLeft,
                  styles.cellBottom,
                  styles.cellValue,
                  { width: "40%", textAlign: "left", fontSize: 8.5 },
                ]}
              >
                <Text>Author:</Text>
              </View>
              <View
                style={[
                  styles.cellTop,
                  styles.cellLeft,
                  styles.cellBottom,
                  styles.cellValue,
                  { width: "60%", textAlign: "left", fontSize: 8.5 },
                ]}
              >
                <Text>ISM</Text>
              </View>
            </View>
          </View>
          <View
            style={[
              styles.cellTop,
              styles.cellLeft,
              styles.cellBottom,
              styles.cellValue,
              styles.w62,
              { textAlign: "left", justifyContent: "center" },
            ]}
          >
            <Text>Site Quality Acceptance Certificate</Text>
          </View>
          <View style={[styles.col, styles.w62]}>
            <View style={[styles.row]}>
              <View
                style={[
                  styles.cellTop,
                  styles.cellLeft,
                  styles.cellRight,

                  styles.cellValue,
                  { width: "100%", textAlign: "left", fontSize: 8.5 },
                ]}
              >
                <Text>{formatValue(item.site_name)}</Text>
              </View>
            </View>
            <View style={[styles.row]}>
              <View
                style={[
                  styles.cellTop,
                  styles.cellLeft,

                  styles.cellValue,
                  { width: "40%", textAlign: "left", fontSize: 8.5 },
                ]}
              >
                <Text>Last Updated:</Text>
              </View>
              <View
                style={[
                  styles.cellTop,
                  styles.cellLeft,
                  styles.cellRight,
                  styles.cellValue,
                  { width: "60%", textAlign: "left", fontSize: 8.5 },
                ]}
              >
                <Text>{today}</Text>
              </View>
            </View>
            <View style={[styles.row]}>
              <View
                style={[
                  styles.cellTop,
                  styles.cellLeft,
                  styles.cellBottom,
                  styles.cellValue,
                  { width: "40%", textAlign: "left", fontSize: 8.5 },
                ]}
              >
                <Text>Page: 1/1</Text>
              </View>
              <View
                style={[
                  styles.cellTop,
                  styles.cellLeft,
                  styles.cellRight,
                  styles.cellBottom,
                  styles.cellValue,
                  { width: "60%", textAlign: "left", fontSize: 8.5 },
                ]}
              >
                <Text>Version: 2024</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
      {/* Page 2 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>KPI STATISTICAL 4G</Text>

        <View style={styles.row}>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>Site ID</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.site)}</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>SDR Manager</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellRight, styles.cellValue, styles.w62]}>
            <Text>{"---"}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>eNodeB Name</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellValue, styles.w62]}>
            <Text>{"---"}</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>eNodeB ID</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellRight, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.enodeb_id)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>Band SOW</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.band)}</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>CI</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellRight, styles.cellValue, styles.w62]}>
            <Text>{"---"}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>TAC</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.city)}</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>Detail SOW</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellRight, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.type_of_work)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>Band Impact</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.band_impact)}</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>Connected Date</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellRight, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.connected)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>City</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.city)}</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellLabel, styles.w37]}>
            <Text>Integrated Date</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellRight, styles.cellValue, styles.w62]}>
            <Text>{formatValue(item.connected)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellBottom, styles.cellLabel, styles.w37]}>
            <Text>Site Longitude</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellBottom, styles.cellValue, styles.w62]}>
            <Text>{"---"}</Text>
          </View>
          <View style={[styles.cellTop, styles.cellLeft, styles.cellBottom, styles.cellLabel, styles.w37]}>
            <Text>Site Latitude</Text>
          </View>
          <View
            style={[styles.cellTop, styles.cellLeft, styles.cellRight, styles.cellBottom, styles.cellValue, styles.w62]}
          >
            <Text>{"---"}</Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 8,
            alignItems: "flex-start",
            marginLeft: -2,
          }}
        >
          <Image src={`/chart-for-doc/${wid}-table-target-kpi-4g.jpg`} style={{ width: 518, height: "auto" }} />
        </View>

        <Text style={[styles.header2, { marginTop: 10 }]}>1. Statistical Quality</Text>

        <Text style={[styles.subHeader]}>1.1 NE Level Performance</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image src={`/chart-for-doc/${wid}-table-kpi-statistic-4g.jpg`} style={{ width: 400, height: "auto" }} />
        </View>
      </Page>

      {/* Page 3 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>2G SITE QUALITY ACCEPTANCE CERTIFICATE</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image src={`/chart-for-doc/${wid}-table-sqac-information-2g.jpg`} style={{ width: 518, height: "auto" }} />
        </View>

        <Text style={[styles.header2, { marginTop: 8 }]}>Sales Cluster Target Performance</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image src={`/chart-for-doc/${wid}-table-target-kpi-2g.jpg`} style={{ width: 518, height: "auto" }} />
        </View>

        <Text style={[styles.header2, { marginTop: 8 }]}>Site Level Performance</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image src={`/chart-for-doc/${wid}-table-kpi-statistic-2g.jpg`} style={{ width: 518, height: "auto" }} />
        </View>
      </Page>

      {/* Page 4 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>
        <Text style={[styles.header2, { marginTop: 10 }]}>2. Productivity Info</Text>

        <Text style={[styles.subHeader]}>2.1 Productivity Information Payload</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image src={`/chart-for-doc/${wid}-table-productivity-payload.jpg`} style={{ width: 518, height: "auto" }} />
        </View>

        <View style={styles.boxRemark}>
          <Text style={{ fontSize: 8 }}>Remark:</Text>
        </View>

        <Text style={[styles.subHeader]}>2.2 Productivity Information Traffic</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image src={`/chart-for-doc/${wid}-table-productivity-traffic.jpg`} style={{ width: 518, height: "auto" }} />
        </View>
        <View style={styles.boxRemark}>
          <Text style={{ fontSize: 8 }}>Remark:</Text>
        </View>
      </Page>

      {/* Page 5, chart payload-thp-user */}
      <Page size={[595.28, 992.13]} style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>
        <Text style={[styles.header2, { marginTop: 10 }]}>3. Chart Productivity</Text>

        <Text style={[styles.subHeader]}>3.1. LTE Payload, Max DL Throughput & User Number LTE</Text>
        <Text style={[styles.subHeader, { marginTop: 6 }]}>Sector 1</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image
            src={`/chart-for-doc/${wid}-chart-payload-thp-user-${wid.slice(0, 6).toLowerCase()}_1.jpg`}
            style={{ width: 518, height: "auto" }}
          />
        </View>
        <View style={[styles.boxRemark, { marginTop: 6 }]}>
          <Text style={{ fontSize: 8 }}>Remark:</Text>
        </View>

        <Text style={[styles.subHeader, { marginTop: 6 }]}>Sector 2</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image
            src={`/chart-for-doc/${wid}-chart-payload-thp-user-${wid.slice(0, 6).toLowerCase()}_2.jpg`}
            style={{ width: 518, height: "auto" }}
          />
        </View>
        <View style={[styles.boxRemark, { marginTop: 6 }]}>
          <Text style={{ fontSize: 8 }}>Remark:</Text>
        </View>

        <Text style={[styles.subHeader, { marginTop: 6 }]}>Sector 3</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image
            src={`/chart-for-doc/${wid}-chart-payload-thp-user-${wid.slice(0, 6).toLowerCase()}_3.jpg`}
            style={{ width: 518, height: "auto" }}
          />
        </View>
        <View style={[styles.boxRemark, { marginTop: 6 }]}>
          <Text style={{ fontSize: 8 }}>Remark:</Text>
        </View>
      </Page>

      {/* Page 6, chart payload-thp-user */}
      <Page size={[595.28, 992.13]} style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={[styles.header2, { marginTop: 10 }]}>
          3.2. Total Payload Site Level & Payload 1st tier Site Level
        </Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image src={`/chart-for-doc/${wid}-chart-payload-band-site-sow.jpg`} style={{ width: 518, height: "auto" }} />
        </View>
        <View style={[styles.boxRemark, { marginTop: 6 }]}>
          <Text style={{ fontSize: 8 }}>Remark:</Text>
        </View>

        <View style={{ marginTop: 16, alignItems: "flex-start", marginLeft: -2 }}>
          <Image
            src={`/chart-for-doc/${wid}-chart-payload-band-site-tier.jpg`}
            style={{ width: 518, height: "auto" }}
          />
        </View>
        <View style={[styles.boxRemark, { marginTop: 6 }]}>
          <Text style={{ fontSize: 8 }}>Remark:</Text>
        </View>

        <Text style={[styles.header2, { marginTop: 10 }]}>3.3. PRB Utilization & RRC Connection User</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image src={`/chart-for-doc/${wid}-chart-rrc-utilization.jpg`} style={{ width: 518, height: "auto" }} />
        </View>
        <View style={[styles.boxRemark, { marginTop: 6 }]}>
          <Text style={{ fontSize: 8 }}>Remark:</Text>
        </View>
      </Page>

      {/* page 7, traffic 2g cell level, site level, volte */}
      <Page size={[595.28, 992.13]} style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={[styles.header2, { marginTop: 10 }]}>3.4. Traffic Cell Level & Site Level 2G</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image
            src={`/chart-for-doc/${wid}-chart-traffic-2g-cell-site-sow.jpg`}
            style={{ width: 518, height: "auto" }}
          />
        </View>
        <View style={[styles.boxRemark, { marginTop: 6 }]}>
          <Text style={{ fontSize: 8 }}>Remark:</Text>
        </View>

        <Text style={[styles.header2, { marginTop: 10 }]}>3.5. Traffic Site Level & Cluster Level 2G</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image src={`/chart-for-doc/${wid}-chart-traffic-2g-site-tier.jpg`} style={{ width: 518, height: "auto" }} />
        </View>
        <View style={[styles.boxRemark, { marginTop: 6 }]}>
          <Text style={{ fontSize: 8 }}>Remark:</Text>
        </View>

        <Text style={[styles.header2, { marginTop: 10 }]}>3.6. Traffic Volte</Text>
        {/* <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image
            src={`/chart-for-doc/${wid}-chart-volte.jpg`}
            style={{ width: 518, height: "auto" }}
          />
        </View> */}
      </Page>

      {/* Page 8, chart payload 2g, cell level, site level */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={[styles.header2, { marginTop: 10 }]}>3.7. Payload Cell Level & Site Level 2G</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image
            src={`/chart-for-doc/${wid}-chart-payload-2g-cell-site-sow.jpg`}
            style={{ width: 518, height: "auto" }}
          />
        </View>
        <View style={[styles.boxRemark, { marginTop: 6 }]}>
          <Text style={{ fontSize: 8 }}>Remark:</Text>
        </View>

        <Text style={[styles.header2, { marginTop: 10 }]}>3.8. Payload Site level & Cluster Level 2G</Text>
        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image src={`/chart-for-doc/${wid}-chart-payload-2g-site-tier.jpg`} style={{ width: 518, height: "auto" }} />
        </View>
        <View style={[styles.boxRemark, { marginTop: 6 }]}>
          <Text style={{ fontSize: 8 }}>Remark:</Text>
        </View>
      </Page>

      {/* Page 9, total traffic/payload mini cluster */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={[styles.header2, { marginTop: 10 }]}>4.1. Total Traffic Mini Cluster 2G</Text>
        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image src={`/chart-for-doc/${wid}-chart-traffic-mini-cluster.jpg`} style={{ width: 518, height: "auto" }} />
        </View>
        <View style={[styles.boxRemark, { marginTop: 6 }]}>
          <Text style={{ fontSize: 8 }}>Remark:</Text>
        </View>

        <Text style={[styles.header2, { marginTop: 10 }]}>4.2. Total Payload Mini Cluster 2G-4G</Text>
        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image src={`/chart-for-doc/${wid}-chart-payload-mini-cluster.jpg`} style={{ width: 518, height: "auto" }} />
        </View>
        <View style={[styles.boxRemark, { marginTop: 6 }]}>
          <Text style={{ fontSize: 8 }}>Remark:</Text>
        </View>
      </Page>

      {/* Page 10, table prb, chart payload, chart util per sector */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={[styles.header2, { marginTop: 10 }]}>PRB Utilization</Text>
        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image src={`/chart-for-doc/${wid}-table-prb-utilization-4g.jpg`} style={{ width: 518, height: "auto" }} />
        </View>

        <View
          style={{
            marginTop: 16,
            alignItems: "flex-start",
            flexDirection: "row",
          }}
        >
          <View style={{ marginRight: 8 }}>
            <Image
              src={`/chart-for-doc/${wid}-chart-payload-cell-per-sector-util-${wid.slice(0, 6).toLowerCase()}_1.jpg`}
              style={{ width: 230, height: "auto" }}
            />
          </View>
          <View>
            <Image
              src={`/chart-for-doc/${wid}-chart-payload-cell-per-sector-payload-${wid.slice(0, 6).toLowerCase()}_1.jpg`}
              style={{ width: 230, height: "auto" }}
            />
          </View>
        </View>
        <View
          style={{
            marginTop: 16,
            alignItems: "flex-start",
            flexDirection: "row",
          }}
        >
          <View style={{ marginRight: 8 }}>
            <Image
              src={`/chart-for-doc/${wid}-chart-payload-cell-per-sector-util-${wid.slice(0, 6).toLowerCase()}_2.jpg`}
              style={{ width: 230, height: "auto" }}
            />
          </View>
          <View>
            <Image
              src={`/chart-for-doc/${wid}-chart-payload-cell-per-sector-payload-${wid.slice(0, 6).toLowerCase()}_2.jpg`}
              style={{ width: 230, height: "auto" }}
            />
          </View>
        </View>
        <View
          style={{
            marginTop: 16,
            alignItems: "flex-start",
            flexDirection: "row",
          }}
        >
          <View style={{ marginRight: 8 }}>
            <Image
              src={`/chart-for-doc/${wid}-chart-payload-cell-per-sector-util-${wid.slice(0, 6).toLowerCase()}_3.jpg`}
              style={{ width: 230, height: "auto" }}
            />
          </View>
          <View>
            <Image
              src={`/chart-for-doc/${wid}-chart-payload-cell-per-sector-payload-${wid.slice(0, 6).toLowerCase()}_3.jpg`}
              style={{ width: 230, height: "auto" }}
            />
          </View>
        </View>
      </Page>

      {/* eof */}
    </Document>
  );
}

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 8.5,
    fontFamily: "Helvetica",
  },
  logoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    width: 80,
    height: "auto",
  },
  header: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  header2: {
    fontSize: 9,
    marginBottom: 4,
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 8.5,
    marginBottom: 4,
  },
  paragraphNormal: {
    fontSize: 8.5,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
  },
  col: {
    flexDirection: "column",
  },
  cell: {
    padding: 4,
    borderWidth: 0.3,
    borderColor: "#000",
  },
  cellTop: {
    padding: 2,
    borderTopWidth: 0.3,
    // borderWidth: 0.3,
    borderColor: "#000",
  },
  cellLeft: {
    padding: 2,
    borderLeftWidth: 0.3,
    borderColor: "#000",
  },
  cellRight: {
    padding: 2,
    borderRightWidth: 0.3,
    borderColor: "#000",
  },
  cellBottom: {
    padding: 2,
    borderBottomWidth: 0.3,
    borderColor: "#000",
  },
  cellLabel: {
    fontWeight: "bold",
    // backgroundColor: "#f0f0f0",
  },
  cellValue: {
    textAlign: "center",
  },
  w37: {
    width: "37.5%",
  },
  w62: {
    width: "62.5%",
  },
  w32: {
    width: "32%",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 0.3,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkmark: {
    fontSize: 8.5,
    fontWeight: "bold",
  },
  boxRemark: {
    alignItems: "flex-start",
    marginLeft: 0,
    borderWidth: 0.3,
    borderColor: "#000",
    marginTop: 2,
    padding: 4,
    marginBottom: 8,
    height: 40,
  },
});

// Apply styles to the page component
Object.assign(SqacPdfPage.prototype, { styles: styles });

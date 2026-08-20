import { Document, Image, Page, Path, Rect, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";

import type { DataActivityLog, SqacFirstTierItem, TaDataItem } from "@/app/(project)/mdoc/def/interfaces";

import { getImageSrc } from "./SqacKpiPdfPage";

const LOGO_TINFRA = "/images/logo/logo-tinfra.png";
const LOGO_TELKOMSEL = "/images/logo/logo-telkomsel.png";

export interface SqacPdfPageProps {
  item: {
    siteid?: string | null;
    band_4g_sow?: string | null;
    band_2g_sow?: string | null;
    site_name?: string | null;
    site_name_4g?: string | null;
    enodeb_id?: string | null;
    type_of_work?: string | null;
    tac?: string | null;
    kabupaten?: string | null;
    cell_id_4g?: string | null;
    cell_id?: string | null;
    band_impact?: string | null;
    connected?: string | null;
    dt?: string | null;
    longitude?: string | null;
    latitude?: string | null;
    sdr_manager?: string | null;
  };
  wid: string;
  dataActivity: DataActivityLog[];
  dataTa4g: TaDataItem[];
  dataGetSqacFirstTier: SqacFirstTierItem[];
  dataGetTa4GTier: TaDataItem[];
  baseUrl?: string;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function formatValue(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") return "---";
  return value;
}

export function SqacClearAlarmPdfPage({
  baseUrl,
  item,
  wid,
  dataActivity,
  dataTa4g,
  dataGetSqacFirstTier,
  dataGetTa4GTier,
}: SqacPdfPageProps) {
  // Helper function to build absolute image URLs
  const imageSrc = (path: string) => getImageSrc(path, baseUrl);

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

  console.log({ dataTa4g });

  return (
    <Document>
      {/* Page 1 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>ACTIVITY LOG INFORMATION</Text>

        <View
          style={{
            marginTop: 8,
            alignItems: "flex-start",
            flexDirection: "column",
          }}
        >
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-table-clear-alarm-info-4g.jpg`)}
              style={{ width: 520, height: "auto" }}
            />
          </View>
          <View>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-table-activity-log-4g.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
        </View>
      </Page>

      {/* Page 2 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>TREND KPI INFORMATION 4G</Text>

        <View
          style={{
            marginTop: 8,
            alignItems: "flex-start",
            flexDirection: "column",
          }}
        >
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-4g-availability.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-4g-rrc_setup.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-4g-erab_setup.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
        </View>
      </Page>

      {/* Page 3 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>TREND KPI INFORMATION 4G</Text>

        <View
          style={{
            marginTop: 8,
            alignItems: "flex-start",
            flexDirection: "column",
          }}
        >
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-4g-cssr.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-4g-erab_drop.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-4g-ifho.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
        </View>
      </Page>

      {/* Page 4 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>TREND KPI INFORMATION 4G</Text>

        <View
          style={{
            marginTop: 8,
            alignItems: "flex-start",
            flexDirection: "column",
          }}
        >
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-4g-csfb.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-4g-cqi_average.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-4g-se2.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
        </View>
      </Page>

      {/* Page 5 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>TREND KPI INFORMATION 4G</Text>

        <View
          style={{
            marginTop: 8,
            alignItems: "flex-start",
            flexDirection: "column",
          }}
        >
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-4g-number_csfb.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-2g-fast_return_lte.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-4g-payload_ca.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
        </View>
      </Page>

      {/* Page 6 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>TREND KPI INFORMATION 2G</Text>

        <View
          style={{
            marginTop: 8,
            alignItems: "flex-start",
            flexDirection: "column",
          }}
        >
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-2g-availability.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-2g-sdsr.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-2g-hosr.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
        </View>
      </Page>

      {/* Page 7 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>TREND KPI INFORMATION 2G</Text>

        <View
          style={{
            marginTop: 8,
            alignItems: "flex-start",
            flexDirection: "column",
          }}
        >
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-2g-dcr.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-2g-tbf_dl.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
          <View style={{ marginBottom: 8 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-2g-tbf_comp.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
        </View>
      </Page>

      {/* Page 8 ta band sow */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>TIMING ADVANCE BAND {item.band_4g_sow?.toUpperCase()}</Text>

        {[...new Set(dataTa4g.filter((d) => d.band === item.band_4g_sow).map((d) => d.cellId))].map((cellId) => {
          const formatBandSow =
            item.band_4g_sow === "L900"
              ? "MT"
              : item.band_4g_sow === "L1800"
                ? "ML"
                : item.band_4g_sow === "L2100"
                  ? "MR"
                  : item.band_4g_sow === "L2300"
                    ? "ME"
                    : "No Band";
          const refKey = `band-${item.band_4g_sow?.toLowerCase()}-cellid-${cellId}`;
          return (
            <View
              key={cellId}
              style={{
                marginTop: 8,
                alignItems: "flex-start",
                flexDirection: "column",
              }}
            >
              <Text style={styles.subHeader}>
                Sector_{cellId.toString().slice(0, -1)}
                {formatBandSow}
              </Text>
              <View
                key={cellId}
                style={{
                  marginTop: 2,
                  alignItems: "flex-start",
                  flexDirection: "row",
                }}
              >
                <View style={{ marginRight: 10 }}>
                  <Image
                    src={imageSrc(`/chart-for-doc/${wid}-chart-ta-4g-band-sow-${refKey}.jpg`)}
                    style={{ width: 340, height: "auto" }}
                  />
                </View>
                <View>
                  <Image src={imageSrc(`/chart-for-doc/${wid}-map_ta.jpg`)} style={{ width: 168, height: "auto" }} />
                </View>
              </View>
            </View>
          );
        })}
      </Page>

      {/* Page 9 ta band not sow */}
      {[...new Set(dataTa4g.filter((d) => d.band !== item.band_4g_sow).map((item) => item.band))].sort().map((band) => (
        <Page size="A4" style={styles.page} key={band}>
          <View style={styles.logoRow}>
            <Image src={LOGO_TINFRA} style={styles.logo} />
            <Image src={LOGO_TELKOMSEL} style={styles.logo} />
          </View>

          <Text style={styles.header}>TIMING ADVANCE BAND {band}</Text>
          {[...new Set(dataTa4g.filter((d) => d.band === band).map((item) => item.cellId))].sort().map((cellId) => {
            const item = dataTa4g.find((d) => d.cellId === cellId && d.band === band);
            const refKey = `band-${band.toLowerCase()}-cellid-${cellId}`;
            const formatBand =
              band === "L900"
                ? "MT"
                : band === "L1800"
                  ? "ML"
                  : band === "L2100"
                    ? "MR"
                    : band === "L2300"
                      ? "ME"
                      : "No Band";
            return (
              <View
                key={cellId}
                style={{
                  marginTop: 8,
                  alignItems: "flex-start",
                  flexDirection: "column",
                }}
              >
                <Text style={styles.subHeader}>
                  Sector_{item?.sector}
                  {formatBand}
                </Text>
                <View
                  key={cellId}
                  style={{
                    marginTop: 2,
                    alignItems: "flex-start",
                    flexDirection: "row",
                  }}
                >
                  <View style={{ marginRight: 10 }}>
                    <Image
                      src={imageSrc(`/chart-for-doc/${wid}-chart-ta-4g-band-not-sow-${refKey}.jpg`)}
                      style={{ width: 340, height: "auto" }}
                    />
                  </View>
                  <View>
                    <Image src={imageSrc(`/chart-for-doc/${wid}-map_ta.jpg`)} style={{ width: 168, height: "auto" }} />
                  </View>
                </View>
              </View>
            );
          })}
        </Page>
      ))}

      {/* TA 1st Tier - with auto-pagination (max 3 charts per page) */}
      {(() => {
        if (
          !dataGetSqacFirstTier ||
          dataGetSqacFirstTier.length === 0 ||
          !dataGetTa4GTier ||
          dataGetTa4GTier.length === 0
        ) {
          return null;
        }

        const siteidTiers = [...new Set(dataGetSqacFirstTier.map((t) => t.siteid_tier))];
        const pages: Array<{
          siteidTier: string;
          charts: Array<{
            band: string;
            cellId: string;
            refKey: string;
            label: string;
          }>;
        }> = [];

        siteidTiers.forEach((siteidTier) => {
          const tierKey = String(siteidTier);
          const tierItems = dataGetSqacFirstTier.filter((t) => String(t.siteid_tier) === tierKey);
          const sectorTiers = tierItems.map((t) => t.sector_tier);
          const filteredTierData = dataGetTa4GTier.filter(
            (d) => d.siteid === siteidTier && sectorTiers.includes(d.sector?.toString() ?? ""),
          );

          const bands = [...new Set(filteredTierData.map((d) => d.band))].sort();
          bands.forEach((band) => {
            const cellIds = [
              ...new Set(filteredTierData.filter((d) => d.band === band).map((d) => String(d.cellId))),
            ].sort();
            cellIds.forEach((cellId) => {
              const cellIdStr = String(cellId);
              const refKey = `${tierKey.toLowerCase()}-${band.toLowerCase()}-cellid-${cellIdStr}`;
              const matchingData = filteredTierData.filter((d) => d.band === band && String(d.cellId) === cellIdStr);
              const label = matchingData[0]?.siteid_short_band_sector ?? `Cell ${cellIdStr}`;

              // Find existing page with less than 3 charts for same siteidTier, or create new page
              let targetPage = pages.find((p) => p.siteidTier === tierKey && p.charts.length < 3);
              if (!targetPage) {
                targetPage = { siteidTier: tierKey, charts: [] };
                pages.push(targetPage);
              }
              targetPage.charts.push({
                band,
                cellId: cellIdStr,
                refKey,
                label,
              });
            });
          });
        });

        return pages.map((page, pageIndex) => (
          <Page key={`${page.siteidTier}-${pageIndex}`} size="A4" style={styles.page}>
            <View style={styles.logoRow}>
              <Image src={LOGO_TINFRA} style={styles.logo} />
              <Image src={LOGO_TELKOMSEL} style={styles.logo} />
            </View>
            <Text style={styles.header}>TA 1st Tier</Text>
            <View
              style={{
                marginTop: 8,
                alignItems: "flex-start",
                flexDirection: "column",
              }}
            >
              {page.charts.map((chart) => (
                <View key={chart.cellId} style={{ marginRight: 10, marginBottom: 12 }}>
                  <Text style={styles.subHeader}>{chart.label}</Text>
                  <Image
                    src={imageSrc(`/chart-for-doc/${wid}-chart-ta-4g-first-tier-${chart.refKey}.jpg`)}
                    style={{ width: 518, height: "auto" }}
                  />
                </View>
              ))}
            </View>
          </Page>
        ));
      })()}

      {/* Page 10 */}
      {/* <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>TA 1st Tier</Text>

        <View
          style={{
            marginTop: 8,
            alignItems: "flex-start",
            flexDirection: "column",
          }}>
          <View style={{ marginBottom: 8 }}>
            <Image
              src={`/chart-for-doc/${wid}-map_ta`}
              style={{ width: 518, height: "auto" }}
            />
          </View>
        </View>
      </Page> */}

      {/* Page 11 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={[styles.subHeader, { marginTop: 8 }]}>AVERAGE NI per RB</Text>

        <View
          style={{
            marginTop: 0,
            alignItems: "flex-start",
            flexDirection: "column",
          }}
        >
          <View style={{ marginBottom: 0 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-4g-ni_carrier.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
        </View>

        <Text style={[styles.subHeader, { marginTop: 12 }]}>Uplink RSSI (dBm)</Text>

        <View
          style={{
            marginTop: 0,
            alignItems: "flex-start",
            flexDirection: "column",
          }}
        >
          <View style={{ marginBottom: 0 }}>
            <Image
              src={imageSrc(`/chart-for-doc/${wid}-chart-kpi-4g-rssi.jpg`)}
              style={{ width: 518, height: "auto" }}
            />
          </View>
        </View>
      </Page>

      {/* Page 12 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={[styles.subHeader, { marginTop: 8 }]}>SD TO TCH</Text>

        <View
          style={{
            marginTop: 0,
            alignItems: "flex-start",
            flexDirection: "column",
          }}
        >
          <View style={{ marginBottom: 0 }}>
            <Image src={imageSrc(`/chart-for-doc/${wid}-sd_to_tch.jpg`)} style={{ width: 518, height: "auto" }} />
          </View>
        </View>

        <Text style={[styles.subHeader, { marginTop: 8 }]}>Packet Loss</Text>

        <View
          style={{
            marginTop: 0,
            alignItems: "flex-start",
            flexDirection: "column",
          }}
        >
          <View style={{ marginBottom: 0 }}>
            <Image src={imageSrc(`/chart-for-doc/${wid}-packet_loss.jpg`)} style={{ width: 518, height: "auto" }} />
          </View>
        </View>

        <Text style={[styles.subHeader, { marginTop: 8 }]}>Active Alarm</Text>

        <View
          style={{
            marginTop: 0,
            alignItems: "flex-start",
            flexDirection: "column",
          }}
        >
          <View style={{ marginBottom: 0 }}>
            <Image src={imageSrc(`/chart-for-doc/${wid}-active_alarm.jpg`)} style={{ width: 518, height: "auto" }} />
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
Object.assign(SqacClearAlarmPdfPage.prototype, { styles: styles });

import { Document, Image, Page, Path, Rect, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";

import type { DataActivityLog } from "@/app/(project)/mdoc/def/interfaces";

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
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("en-GB");
}

function formatValue(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") return "---";
  return value;
}

export function SqacDtReportPdfPage({ item, wid, dataActivity }: SqacPdfPageProps) {
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

  // console.log({ dataActivity });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>DRIVETEST REPORT</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image src={`/chart-for-doc/${wid}-dtr-info.jpg`} style={{ width: 518, height: "auto" }} />
        </View>

        <Text style={[styles.header2, { marginTop: 8 }]}>Drive Test Quality</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 4,
          }}
        >
          <Text style={[{ fontStyle: "italic", color: "blue", marginRight: 8 }]}>Remarks:</Text>
          <View style={{ alignItems: "flex-start" }}>
            <Text style={[{ fontStyle: "italic", color: "blue" }]}>(1) Drive Test (CovMo-MDT)</Text>
            <Text style={[{ fontStyle: "italic", color: "blue" }]}>
              (2) For statistic calculation is only compare to statistic calculation of coverage plot
            </Text>
          </View>
        </View>

        <Text style={[styles.header2, { marginTop: 8 }]}>1. Table KPI 4G</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2 }}>
          <Image src={`/chart-for-doc/${wid}-dtr-kpi.jpg`} style={{ width: 518, height: "auto" }} />
        </View>
      </Page>

      {/* page 2 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>COVMO MDT PLOT</Text>

        <View
          style={{
            flexDirection: "column",
            alignItems: "flex-start",
            marginTop: 4,
          }}
        >
          <Text style={[{ fontStyle: "italic", color: "blue", marginRight: 8 }]}>Remarks:</Text>
          <View style={{ alignItems: "flex-start" }}>
            <Text style={[{ fontStyle: "italic", color: "blue" }]}>
              (1) sampling using polygon until 1st tier for non stand alone & 1.5 km for site stand alone
            </Text>
            <Text style={[{ fontStyle: "italic", color: "blue" }]}>(2) Covmo method using MDT unlock</Text>
          </View>
        </View>

        <Text style={{ textAlign: "center", marginTop: 16, fontWeight: "bold" }}>RSRP</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2, marginTop: 4 }}>
          <Image src={`/chart-for-doc/${wid}-covmo_site_rsrp.jpg`} style={{ width: 518, height: "auto" }} />
        </View>

        <Text style={{ textAlign: "center", marginTop: 16, fontWeight: "bold" }}>SINR</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2, marginTop: 4 }}>
          <Image src={`/chart-for-doc/${wid}-covmo_site_sinr.jpg`} style={{ width: 518, height: "auto" }} />
        </View>

        <Text style={{ textAlign: "center", marginTop: 16, fontWeight: "bold" }}>DL Throughput</Text>

        <View style={{ alignItems: "flex-start", marginLeft: -2, marginTop: 4 }}>
          <Image src={`/chart-for-doc/${wid}-covmo_site_dl_throughput.jpg`} style={{ width: 518, height: "auto" }} />
        </View>
      </Page>

      {/* page 3 */}
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>COVMO PER SECTOR</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              L900 Sec 1
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-covmo_l900_sector_1.jpg`} style={{ width: 250, height: "auto" }} />
            </View>
            <Text
              style={{
                color: "blue",
                fontStyle: "italic",
              }}
            >
              Remark: Status Clear
            </Text>
          </View>

          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              L900 Sec 2
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-covmo_l900_sector_2.jpg`} style={{ width: 250, height: "auto" }} />
            </View>
            {/* <Text
              style={{
                color: "blue",
                fontStyle: "italic",
              }}>
              Remark: Status Clear
            </Text> */}
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              L900 Sec 3
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-covmo_l900_sector_3.jpg`} style={{ width: 250, height: "auto" }} />
            </View>
            {/* <Text
              style={{
                paddingTop: 1,
                color: "blue",
                fontStyle: "italic",
              }}>
              Remark: Status Clear
            </Text> */}
          </View>
        </View>
        {/* L1800 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              L1800 Sec 1
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-covmo_l1800_sector_1.jpg`} style={{ width: 250, height: "auto" }} />
            </View>
            <Text
              style={{
                color: "blue",
                fontStyle: "italic",
              }}
            >
              Remark: Status Clear
            </Text>
          </View>

          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              L1800 Sec 2
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-covmo_l1800_sector_2.jpg`} style={{ width: 250, height: "auto" }} />
            </View>
            {/* <Text
              style={{
                color: "blue",
                fontStyle: "italic",
              }}>
              Remark: Status Clear
            </Text> */}
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              L1800 Sec 3
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-covmo_l1800_sector_3.jpg`} style={{ width: 250, height: "auto" }} />
            </View>
            {/* <Text
              style={{
                paddingTop: 1,
                color: "blue",
                fontStyle: "italic",
              }}>
              Remark: Status Clear
            </Text> */}
          </View>
        </View>
      </Page>

      {/* page 4 */}
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>COVMO PER SECTOR</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              L2100 Sec 1
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-covmo_l2100_sector_1.jpg`} style={{ width: 250, height: "auto" }} />
            </View>
            <Text
              style={{
                color: "blue",
                fontStyle: "italic",
              }}
            >
              Remark: Status Clear
            </Text>
          </View>

          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              L2100 Sec 2
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-covmo_l2100_sector_2.jpg`} style={{ width: 250, height: "auto" }} />
            </View>
            {/* <Text
              style={{
                color: "blue",
                fontStyle: "italic",
              }}>
              Remark: Status Clear
            </Text> */}
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              L2100 Sec 3
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-covmo_l2100_sector_3.jpg`} style={{ width: 250, height: "auto" }} />
            </View>
            {/* <Text
              style={{
                paddingTop: 1,
                color: "blue",
                fontStyle: "italic",
              }}>
              Remark: Status Clear
            </Text> */}
          </View>
        </View>
      </Page>

      {/* page 5 */}
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>PANORAMIC VIEW</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              0°
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-panoramic_view_0.jpg`} style={{ width: 180, height: "auto" }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              30°
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-panoramic_view_30.jpg`} style={{ width: 180, height: "auto" }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              60°
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-panoramic_view_60.jpg`} style={{ width: 180, height: "auto" }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              90°
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-panoramic_view_90.jpg`} style={{ width: 180, height: "auto" }} />
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              120°
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-panoramic_view_120.jpg`} style={{ width: 180, height: "auto" }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              150°
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-panoramic_view_150.jpg`} style={{ width: 180, height: "auto" }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              180°
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-panoramic_view_180.jpg`} style={{ width: 180, height: "auto" }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              210°
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-panoramic_view_210.jpg`} style={{ width: 180, height: "auto" }} />
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              240°
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-panoramic_view_240.jpg`} style={{ width: 180, height: "auto" }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              270°
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-panoramic_view_270.jpg`} style={{ width: 180, height: "auto" }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              300°
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-panoramic_view_300.jpg`} style={{ width: 180, height: "auto" }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              330°
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-panoramic_view_330.jpg`} style={{ width: 180, height: "auto" }} />
            </View>
          </View>
        </View>
      </Page>

      {/* page 6 */}
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>DATA SECTORAL</Text>

        <Text
          style={{
            textAlign: "center",
            fontWeight: "bold",
            alignSelf: "center",
          }}
        >
          SECTOR-1
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              View Sectoral
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_1_view.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Azimuth
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_1_azimuth.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Electrical Tilt
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_1_et.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Mechanical Tilt
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_1_mt.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Antenna Height
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_1_height.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Antenna Type
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_1_type.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              {" "}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              {" "}
            </Text>
          </View>
        </View>
      </Page>

      {/* page 7 */}
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>DATA SECTORAL</Text>

        <Text
          style={{
            textAlign: "center",
            fontWeight: "bold",
            alignSelf: "center",
          }}
        >
          SECTOR-2
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              View Sectoral
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_2_view.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Azimuth
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_2_azimuth.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Electrical Tilt
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_2_et.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Mechanical Tilt
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_2_mt.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Antenna Height
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_2_height.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Antenna Type
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_2_type.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              {" "}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              {" "}
            </Text>
          </View>
        </View>
      </Page>

      {/* page 8 */}
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>DATA SECTORAL</Text>

        <Text
          style={{
            textAlign: "center",
            fontWeight: "bold",
            alignSelf: "center",
          }}
        >
          SECTOR-3
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              View Sectoral
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_3_view.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Azimuth
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_3_azimuth.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Electrical Tilt
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_3_et.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Mechanical Tilt
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_3_mt.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Antenna Height
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_3_height.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Antenna Type
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_sectoral_3_type.jpg`} style={{ width: 180, height: 154 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              {" "}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              {" "}
            </Text>
          </View>
        </View>
      </Page>

      {/* page 9 */}
      <Page size="A4" style={styles.page} orientation="portrait">
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>DATA SITE</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Site
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_site_tower.jpg`} style={{ width: 170, height: 250 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Rack/BTS/Shelter
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_site_rack.jpg`} style={{ width: 170, height: 250 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Marking GPS
            </Text>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_site_gps.jpg`} style={{ width: 170, height: 250 }} />
            </View>
            <View style={{ flexDirection: "column", padding: 2 }}>
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  alignSelf: "flex-start",
                }}
              >
                Longitude:
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  alignSelf: "flex-start",
                }}
              >
                Latitude:
              </Text>
            </View>
          </View>
        </View>
      </Page>

      {/* page 10 */}
      <Page size="A4" style={styles.page} orientation="portrait">
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>RET</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_site_ret.jpg`} style={{ width: 518, height: "auto" }} />
            </View>
          </View>
        </View>
      </Page>

      {/* page 11 */}
      <Page size="A4" style={styles.page} orientation="portrait">
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>VALIDASI LONGLAT</Text>

        <View
          style={{
            flexDirection: "column",
            alignItems: "flex-start",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image
                src={`/chart-for-doc/${wid}-data_site_validasi_longlat_ge.jpg`}
                style={{ width: 518, height: "auto" }}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <View
                style={{
                  alignItems: "flex-start",
                  padding: 2,
                }}
              >
                <Image src={`/chart-for-doc/${wid}-data_site_gps.jpg`} style={{ width: 170, height: "auto" }} />
              </View>
              <View style={{ flexDirection: "column", padding: 2 }}>
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    alignSelf: "flex-start",
                  }}
                >
                  Longitude:
                </Text>
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    alignSelf: "flex-start",
                  }}
                >
                  Latitude:
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  alignSelf: "center",
                }}
              >
                Long Lat On Data OSS :
              </Text>
              <View
                style={{
                  alignItems: "flex-start",
                  padding: 2,
                }}
              >
                <Image
                  src={`/chart-for-doc/${wid}-data_site_validasi_longlat_ume.jpg`}
                  style={{ width: 345, height: "auto" }}
                />
              </View>
              <View
                style={{
                  alignItems: "flex-start",
                  padding: 2,
                }}
              >
                <Image src={`/chart-for-doc/${wid}-dtr-nodin.jpg`} style={{ width: 345, height: "auto" }} />
              </View>
            </View>
          </View>
        </View>
      </Page>

      {/* page 12 */}
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>NEW SITE INFORMATION & DATA CONFIGURATION ANTENNA</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
            alignSelf: "center",
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-dtr-antenna-config.jpg`} style={{ width: 600, height: "auto" }} />
            </View>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
                marginTop: 6,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_site_acr.jpg`} style={{ width: 600, height: "auto" }} />
            </View>
          </View>
        </View>
      </Page>

      {/* page 13 */}
      <Page size="A4" style={styles.page} orientation="portrait">
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>Sambungan Kabel Power</Text>
        <Text
          style={{
            textAlign: "center",
            alignSelf: "flex-start",
            marginTop: 12,
          }}
        >
          Remark : Tidak ada sambungan kabel power , SOW Low To High
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 8,
            alignSelf: "center",
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_site_kabel_power_1.jpg`} style={{ width: 250, height: "auto" }} />
            </View>
            <View
              style={{
                alignItems: "flex-start",
                padding: 2,
              }}
            >
              <Image src={`/chart-for-doc/${wid}-data_site_kabel_power_3.jpg`} style={{ width: 250, height: "auto" }} />
            </View>
          </View>
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image src={`/chart-for-doc/${wid}-data_site_kabel_power_2.jpg`} style={{ width: 250, height: "auto" }} />
          </View>
        </View>
      </Page>

      {/* page 14 */}
      <Page size="A4" style={styles.page} orientation="portrait">
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>Bracket RRU L900</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 2,
          }}
        >
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image src={`/chart-for-doc/${wid}-data_site_bracket_rru_l900_1.jpg`} style={{ width: 170, height: 200 }} />
          </View>
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image src={`/chart-for-doc/${wid}-data_site_bracket_rru_l900_2.jpg`} style={{ width: 170, height: 200 }} />
          </View>
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image src={`/chart-for-doc/${wid}-data_site_bracket_rru_l900_3.jpg`} style={{ width: 170, height: 200 }} />
          </View>
        </View>
        <Text style={[styles.header, { marginTop: 12 }]}>Bracket RRU L1800</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 2,
          }}
        >
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image
              src={`/chart-for-doc/${wid}-data_site_bracket_rru_l1800_1.jpg`}
              style={{ width: 170, height: 200 }}
            />
          </View>
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image
              src={`/chart-for-doc/${wid}-data_site_bracket_rru_l1800_2.jpg`}
              style={{ width: 170, height: 200 }}
            />
          </View>
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image
              src={`/chart-for-doc/${wid}-data_site_bracket_rru_l1800_3.jpg`}
              style={{ width: 170, height: 200 }}
            />
          </View>
        </View>

        <Text style={[styles.header, { marginTop: 12 }]}>Bracket RRU L2100</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 2,
          }}
        >
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image
              src={`/chart-for-doc/${wid}-data_site_bracket_rru_l2100_1.jpg`}
              style={{ width: 170, height: 200 }}
            />
          </View>
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image
              src={`/chart-for-doc/${wid}-data_site_bracket_rru_l2100_2.jpg`}
              style={{ width: 170, height: 200 }}
            />
          </View>
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image
              src={`/chart-for-doc/${wid}-data_site_bracket_rru_l2100_3.jpg`}
              style={{ width: 170, height: 200 }}
            />
          </View>
        </View>
      </Page>

      {/* page 15 */}
      <Page size="A4" style={styles.page} orientation="portrait">
        <View style={styles.logoRow}>
          <Image src={LOGO_TINFRA} style={styles.logo} />
          <Image src={LOGO_TELKOMSEL} style={styles.logo} />
        </View>

        <Text style={styles.header}>Jumper Antenna</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 2,
          }}
        >
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image src={`/chart-for-doc/${wid}-data_site_jumper_antena_1.jpg`} style={{ width: 170, height: 200 }} />
          </View>
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image src={`/chart-for-doc/${wid}-data_site_jumper_antena_2.jpg`} style={{ width: 170, height: 200 }} />
          </View>
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image src={`/chart-for-doc/${wid}-data_site_jumper_antena_3.jpg`} style={{ width: 170, height: 200 }} />
          </View>
        </View>

        <Text style={[styles.header, { marginTop: 12 }]}>Bracket Antenna</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 2,
          }}
        >
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image src={`/chart-for-doc/${wid}-data_site_bracket_antena_1.jpg`} style={{ width: 170, height: 200 }} />
          </View>
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image src={`/chart-for-doc/${wid}-data_site_bracket_antena_2.jpg`} style={{ width: 170, height: 200 }} />
          </View>
          <View
            style={{
              alignItems: "flex-start",
              padding: 2,
            }}
          >
            <Image src={`/chart-for-doc/${wid}-data_site_bracket_antena_3.jpg`} style={{ width: 170, height: 200 }} />
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
Object.assign(SqacDtReportPdfPage.prototype, { styles: styles });

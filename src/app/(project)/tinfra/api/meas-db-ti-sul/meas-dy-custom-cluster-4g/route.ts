// biome-ignore assist/source/organizeImports: <none>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v2 } from "../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId") || "---";
  const nop = searchParams.get("nop") || "---";
  const kabupaten = searchParams.get("kabupaten") || "---";
  const salesCluster = searchParams.get("salesCluster") || "---";
  const clusterFilter = searchParams.get("clusterFilter") || "---";
  const tgl_1 = searchParams.get("tgl_1");
  const tgl_2 = searchParams.get("tgl_2");

  if (!tgl_1 || !tgl_2) {
    return NextResponse.json({ error: "Both tgl_1 and tgl_2 parameters are required" }, { status: 400 });
  }

  let formattedTgl1: string;
  let formattedTgl2: string;
  const querySiteId = `%${siteId.toUpperCase()}%`;
  // const queryNop = `%${nop.toUpperCase()}%`;
  const queryKabupaten = `%${kabupaten.toUpperCase()}%`;
  const querySalesCluster = `%${salesCluster.toUpperCase()}%`;

  try {
    formattedTgl1 = new Date(tgl_1).toISOString();
    formattedTgl2 = new Date(tgl_2).toISOString();
    const queryNop = `%${nop.toUpperCase()}%`;

    // Handle multiple clusters - split by comma and filter out empty values
    const clusterValues = clusterFilter.split(",").filter((c) => c.trim() !== "");

    // biome-ignore lint/suspicious/noExplicitAny: <none>
    let clusterFilterCondition: any;
    if (clusterFilter === "---" || clusterFilter === "All" || clusterValues.length === 0) {
      clusterFilterCondition = sql``;
    } else if (clusterValues.length === 1) {
      // Use exact match for single cluster
      clusterFilterCondition = sql`AND tref2.nama_cluster = ${clusterValues[0].trim()}`;
    } else {
      // For multiple clusters, build the IN clause using raw SQL
      const clusterList = clusterValues.map((c) => `'${c.trim()}'`).join(",");
      clusterFilterCondition = sql.raw(`AND tref2.nama_cluster IN (${clusterList})`);
    }

    const result = await db_conn_v2.execute<Data2G4GModel>(sql`
          SELECT
            t1."Begin Time" AS "BEGIN_TIME",
            tref2.nama_cluster AS "G4_NAMA_CLUSTER",
            SUM(t1."DL Traffic Volume (MByte) AMQ") / 1024 AS "DL_PAYLOAD_GB",
            SUM(t1."UL Traffic Volume (MByte) AMQ") / 1024 AS "UL_PAYLOAD_GB",
            SUM(t1."4G Payload (MByte) AMQ") / 1024 AS "TOTAL_PAYLOAD_GB",
            SUM(t1."4G Payload (MByte) AMQ") / 1024 / 1024 AS "TOTAL_PAYLOAD_TB",
            SUM(t1."Traffic_VoLTE_(erl) AMQ") AS "TRAFFIC_VOLTE_ERL",
            SUM(t1."Traffic_VoLTE_(erl) AMQ") / 1024 AS "TRAFFIC_VOLTE_KERL",
            SUM(t1."Maximum Number of RRC Connection User(unit)") AS "G4_SUM_MAX_NUMBER_RRC_CONNECTION_USER",
						SUM(t1."Cell Availability Num 4G AMQ") AS "AVAILABILITY_NUM",
						SUM(t1."Cell Availability Denum 4G AMQ") AS "AVAILABILITY_DENUM",
            SUM(t1."Num RRC Setup SR AMQ") AS "G4_RRC_SETUP_SR_NUM",
						SUM(t1."Denum RRC Setup SR AMQ") AS "G4_RRC_SETUP_SR_DENUM",
            SUM(t1."Num E-RAB Setup SR AMQ") AS "G4_ERAB_SETUP_SR_NUM",
						SUM(t1."Denum E-RAB Setup SR AMQ") AS "G4_ERAB_SETUP_SR_DENUM",
            SUM(t1."Num CSSR AMQ") AS "G4_CSSR_NUM",
						SUM(t1."Denum CSSR AMQ") AS "G4_CSSR_DENUM",
            SUM(t1."Num Service Drop Rate AMQ") AS "G4_SERVICE_DROP_RATE_NUM",
						SUM(t1."Denum Service Drop Rate AMQ") AS "G4_SERVICE_DROP_RATE_DENUM",
						SUM(t2."DL PRB Utilization Num AMQ") AS "G4_DL_PRB_UTILIZATION_NUM",
						SUM(t2."DL PRB Utilization Denum AMQ") AS "G4_DL_PRB_UTILIZATION_DENUM",
         	  SUM(t2."UL PRB Utilization Num AMQ") AS "G4_UL_PRB_UTILIZATION_NUM",
						SUM(t2."UL PRB Utilization Denum AMQ") AS "G4_UL_PRB_UTILIZATION_DENUM",
						SUM(t2."User DL Throughput Num AMQ") AS "G4_USER_DL_THP_NUM",
						SUM(t2."User DL Throughput Denum AMQ") AS "G4_USER_DL_THP_DENUM",
            SUM(t2."User UL Throughput Num AMQ") AS "G4_USER_UL_THP_NUM",
						SUM(t2."User UL Throughput Denum AMQ") AS "G4_USER_UL_THP_DENUM",
						SUM(t1."DL RB Available AMQ") AS "G4_DL_RB_AVAILABLE",
						SUM(t2."spectrum efficiency num") AS "G4_SE_NUM",
						SUM(t2."spectrum efficiency denum") AS "G4_SE_DENUM",
						SUM(t2."Num Average CQI_Rev") AS "G4_AVG_CQI_NUM",
						SUM(t2."Denum Average CQI_Rev") AS "G4_AVG_CQI_DENUM",
						SUM(t1."Average NI of Carrier(dBm)") AS "G4_AVG_NI_CARRIER_DBM",
						SUM(t1."Num CSFB SR AMQ") AS "G4_CSFB_SETUP_SR_NUM",
						SUM(t1."Denum CSFB SR AMQ") AS "G4_CSFB_SETUP_SR_DENUM",
            SUM(t1."Num IFHO SR AMQ") AS "G4_IFHO_SR_NUM",
						SUM(t1."Denum IFHO SR AMQ") AS "G4_IFHO_SR_DENUM",
						SUM(t1."Inter_Freq_HOSR_VoLTE_Num AMQ") AS "G4_INTER_FHO_SR_NUM",
						SUM(t1."Inter_Freq_HOSR_VoLTE_Denum AMQ") AS "G4_INTER_FHO_SR_DENUM",
						SUM(t1."SRVCC_LTE-GSM_HOSR_VoLTE_Num AMQ") AS "G4_SRVCC_E2G_SR_NUM",
						SUM(t1."SRVCC_LTE-GSM_HOSR_VoLTE_Denum AMQ") AS "G4_SRVCC_E2G_SR_DENUM",
						SUM(t1."SRVCC_LTE-UMTS_HOSR_VoLTE_Num AMQ") AS "G4_SRVCC_E2W_SR_NUM",
						SUM(t1."SRVCC_LTE-UMTS_HOSR_VoLTE_Denum AMQ") AS "G4_SRVCC_E2W_SR_DENUM",
            '1' AS "DENUMBY1"
          FROM
            "measDy4g" t1
          LEFT JOIN "measBdbh4g" t2 ON 
            t2."Begin Time" = t1."Begin Time" AND
            t2."ManagedElement ID" = t1."ManagedElement ID" AND
            t2."SubnetWork ID" = t1."SubnetWork ID" AND
            t2."eNodeBId" = t1."eNodeBId" AND
            t2."cellId" = t1."cellId"
          INNER JOIN ref_cell_4g tref ON tref.siteid_cellid = CONCAT (
            CASE
              WHEN SUBSTRING(t1."Cell Name" :: TEXT, 2, 1) IN ('_', '-') THEN
                SUBSTRING(t1."Cell Name" :: TEXT, 3, 6)
              ELSE
                SUBSTRING(t1."Cell Name" :: TEXT, 1, 6)
            END,
            '_',
            t1."cellId"
          )
          INNER JOIN ref_query_cluster tref2 ON tref.siteid = tref2.siteid
          ${clusterFilterCondition}
          WHERE
            t1."Begin Time" >= ${formattedTgl1} :: TIMESTAMP
            AND t1."Begin Time" <= ${formattedTgl2} :: TIMESTAMP
          GROUP BY
            t1."Begin Time",
            tref2.nama_cluster
          ORDER BY
            t1."Begin Time",
            tref2.nama_cluster
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

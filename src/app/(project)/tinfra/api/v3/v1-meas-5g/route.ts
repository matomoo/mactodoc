// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v2 } from "../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fieldToAggregate = searchParams.get("fieldToAggregate") || "---";
  const searchByParams = searchParams.get(fieldToAggregate) || "---";
  const searchBySiteId = searchParams.get("siteId") || "---";

  const tgl_1 = searchParams.get("tgl_1");
  const tgl_2 = searchParams.get("tgl_2");

  if (!tgl_1 || !tgl_2) {
    return NextResponse.json({ error: "Both tgl_1 and tgl_2 parameters are required" }, { status: 400 });
  }

  let formattedTgl1: string;
  let formattedTgl2: string;

  try {
    formattedTgl1 = new Date(tgl_1).toISOString();
    formattedTgl2 = new Date(tgl_2).toISOString();
    const searchValues = searchBySiteId.split(",").filter((c) => c.trim() !== "");

    let searchByCondition: unknown;
    if (fieldToAggregate === "siteid_cellid") {
      if (searchValues.length === 0) {
        searchByCondition = sql``;
      } else if (searchValues.length === 1) {
        searchByCondition = sql`AND tref.siteid = ${searchValues[0].trim()}`;
      } else {
        const multiSearchList = searchValues.map((c) => `'${c.trim()}'`).join(",");
        searchByCondition = sql`AND tref.siteid IN (${sql.raw(multiSearchList)})`;
      }
    }

    console.log({ searchValues });
    console.log(`AND tref.${fieldToAggregate} = ${searchValues[0].trim()}`);

    const result = await db_conn_v2.execute<Data2G4GModel>(sql`
          SELECT
            t1."Begin Time" AS "BEGIN_TIME",
            tref.${sql.raw(fieldToAggregate)} AS "G5_SITEID_CELLID",
            SUM ( t1."Payload(GB)_LW" ) AS "G5_PAYLOAD_GB",
            SUM ( t1."SN_Setup_Success_Rate(%)_LW_Num" ) AS "G5_SN_SETUP_SR_NUM",
            SUM ( t1."SN_Setup_Success_Rate(%)_LW_Denum" ) AS "G5_SN_SETUP_SR_DENUM",
            AVG ( t1."Availability(%)_LW" ) AS "G5_AVAILABILITY_SR",
            SUM ( t1."NR_Retainability(%)_LW_Num" ) AS "G5_RETAINABILITY_NUM",
            SUM ( t1."NR_Retainability(%)_LW_Denum" ) AS "G5_RETAINABILITY_DENUM",
            SUM ( t1."Intra_Handover_Success_Rate(%)_LW_Num" ) AS "G5_INTRA_HO_SR_NUM",
            SUM ( t1."Intra_Handover_Success_Rate(%)_LW_Denum" ) AS "G5_INTRA_HO_SR_DENUM",
            AVG ( t1."User_Throughput_DL(Mbps)_LW" ) AS "G5_USER_THP_MBPS",
            AVG ( t1."Average_CQI-XHJ_1646720281179" ) AS "G5_AVG_CQI",
            AVG ( t1."Uplink_Interference(dBm)_LW" ) AS "G5_UL_INTERFERENCE_DBM",
            SUM ( t1."Num_Spectrum_Eff-xhj_1646720281711" ) AS "G5_SE_NUM",
            SUM ( t1."Denum_Spectrum_Eff-xhj_1646720283300" ) AS "G5_SE_DENUM",
            AVG ( t1."RRC_User_Number_LW" ) AS "G5_RRC_USER_NUMBER",
            AVG ( t1."Active_User_Number_LW" ) AS "G5_ACTIVE_USER_NUMBER",
            MAX ( t1."Max_RRC_User_Number-xhj" ) AS "G5_MAX_RRC_USER_NUMBER",
            SUM ( t1."Inter_Handover_Success_Rate(%)_LW_Num" ) AS "G5_INTER_HO_SR_NUM",
            SUM ( t1."Inter_Handover_Success_Rate(%)_LW_Denum" ) AS "G5_INTER_HO_SR_DENUM",
            SUM ( t1."PRB_Utilization_DL(%)_LW_Num" ) AS "G5_PRB_UTIL_DL_NUM",
            SUM ( t1."PRB_Utilization_DL(%)_LW_Denum" ) AS "G5_PRB_UTIL_DL_DENUM",
            SUM ( t1."PRB_Utilization_UL(%)_LW_Num" ) AS "G5_PRB_UTIL_UL_NUM",
            SUM ( t1."PRB_Utilization_UL(%)_LW_Denum" ) AS "G5_PRB_UTIL_UL_DENUM",
            AVG ( t1."Average_CQI_64 QAM_LW" ) AS "G5_AVG_CQI_64_QAM",
            AVG ( t1."Average_CQI_256 QAM_LW" ) AS "G5_AVG_CQI_256_QAM",
            AVG ( t1."PRB_Ussage_DL_LW" ) AS "G5_PRB_USAGE_DL",
            AVG ( t1."PRB_Ussage_UL_LW" ) AS "G5_PRB_USAGE_UL",
            '1' AS "DENUMBY1" 
        FROM
            "measDy5g" t1
            INNER JOIN ref_cell_5g tref ON tref.siteid_cellid = CONCAT (
            CASE
                    WHEN SUBSTRING ( t1."NRPhysicalCellDU Name" :: TEXT, 2, 1 ) IN ( '_', '-' ) THEN
                    SUBSTRING ( t1."NRPhysicalCellDU Name" :: TEXT, 3, 6 ) ELSE SUBSTRING ( t1."NRPhysicalCellDU Name" :: TEXT, 1, 6 ) 
                END,
                '_',
                t1."nrPhysicalCellDUId" 
            ) 
            ${searchByCondition}
        WHERE
            t1."Begin Time" >= ${formattedTgl1} :: TIMESTAMP 
            AND t1."Begin Time" <= ${formattedTgl2} :: TIMESTAMP 
        GROUP BY
            t1."Begin Time",
            tref.${sql.raw(fieldToAggregate)}
        ORDER BY
            t1."Begin Time",
            tref.${sql.raw(fieldToAggregate)}
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

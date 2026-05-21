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
            tref.${sql.raw(fieldToAggregate)} AS "G2_SITEID_CELLID",
            SUM ( t1."EDGE Payload (Mbyte)_ono" + t1."GPRS Payload (Mbyte)_ono" ) / 1024 AS "G2_PAYLOAD_GB",
            SUM ( t1."TCH Traffic (Erl)_ono" ) AS "G2_TCH_TRAFFIC_ERL",
            SUM ( t1."SDCCH Traffic (Erl)_ono" ) AS "G2_SD_TRAFFIC_ERL",
            SUM ( t1."SDSR_num_ono" ) AS "G2_SDSR_NUM",
            SUM ( t1."SDSR_denum_ono" ) AS "G2_SDSR_DENUM",
            SUM ( t1."SDCCH_Block_num_ono" ) AS "G2_SDBLOCK_NUM",
            SUM ( t1."SDCCH_Block_denum_ono" ) AS "G2_SDBLOCK_DENUM",
            SUM ( t1."TCH_Block_num_ono" ) AS "G2_TCH_BLOCK_NUM",
            SUM ( t1."TCH_Block_denum_ono" ) AS "G2_TCH_BLOCK_DENUM",
            SUM ( t1."Num TBF DL Est SR NFJ_1513202618039-0-17" ) AS "G2_TBF_DL_NUM",
            SUM ( t1."Denum TBF DL Est SR NFJ_1513202618039-0-18" ) AS "G2_TBF_DL_DENUM",
            SUM ( t1."Num TBF UL Est SR NFJ_1513202618039-0-20" ) AS "G2_TBF_UL_NUM",
            SUM ( t1."Denum TBF UL Est SR NFJ_1513202618039-0-21" ) AS "G2_TBF_UL_DENUM",
            SUM ( t1."TCH_Drop_num_ono" ) AS "G2_TCH_DROP_NUM",
            SUM ( t1."TCH_Drop_denum_ono" ) AS "G2_TCH_DROP_DENUM",
            SUM ( t1."Num TBF Comp SR NFJ_1513202618039-0-23" ) AS "G2_TBF_COMP_NUM",
            SUM ( t1."Denum TBF Comp SR NFJ_1513202618039-0-24" ) AS "G2_TBF_COMP_DENUM",
            SUM ( t1."GPRS DL_Throughput (kbps)_ono" ) AS "G2_GPRS_DL_THP_KBPS",
            SUM ( t1."EDGE DL_Throughput (kbps)_ono" ) AS "G2_EDGE_DL_THP_KBPS",
            SUM ( t1."HOSR_num_ono" ) AS "G2_HOSR_NUM",
            SUM ( t1."HOSR_denum_ono" ) AS "G2_HOSR_DENUM",
            SUM ( t1."Num TCH Availability_Ono" ) AS "G2_TCH_AVAILABILITY_NUM",
            SUM ( t1."Denum TCH Availability_ono" ) AS "G2_TCH_AVAILABILITY_DENUM",
            SUM ( t1."Num DL Qual 0-5_ono" ) AS "G2_DL_QUAL_05_NUM",
            SUM ( t1."Denum DL Qual 0-5_Ono" ) AS "G2_DL_QUAL_05_DENUM",
            SUM ( t1."Num UL Qual 0-5_Ono" ) AS "G2_UL_QUAL_05_NUM",
            SUM ( t1."Denum UL Qual 0-5_Ono" ) AS "G2_UL_QUAL_05_DENUM",
            AVG ( t1."Number of TRX" ) AS "G2_NUMBER_TRX",
            AVG ( t1."Number of TCH" ) AS "G2_NUMBER_TCH",
            AVG ( t1."Number of SDCCH" ) AS "G2_NUMBER_SDCCH",
            AVG ( t1."Number of Static PDTCH" ) AS "G2_NUMBER_STATIC_PDTCH",
            AVG ( t1."Number of dynamic PDTCH" ) AS "G2_NUMBER_DYNAMIC_PDTCH",
            SUM ( t1."Num ICM INTERFERENCE_Ono" ) AS "G2_ICM_INTERFERENCE_NUM",
            SUM ( t1."Denum ICM INTERFERENCE_ono" ) AS "G2_ICM_INTERFERENCE_DENUM",
            SUM ( t1."TCH HR Traffic (Erl)_ono" ) AS "G2_TCH_HR_TRAFFIC_ERL",
            SUM ( t1."TCH FR Traffic (Erl)_ono" ) AS "G2_TCH_FR_TRAFFIC_ERL",
            SUM ( t1."Number of fastreturn to UTRAN" ) AS "G2_NUMBER_FASTRETURN_UTRAN",
            SUM ( t1."Number of fastreturn to LTE" ) AS "G2_NUMBER_FASTRETURN_LTE",
            SUM ( t1."DL_EMI_Num_Ono" ) AS "G2_DL_EMI_NUM",
            SUM ( t1."DL_EMI_Denum_Ono" ) AS "G2_DL_EMI_DENUM",
            SUM ( t1."UL_EMI_Num_Ono" ) AS "G2_UL_EMI_NUM",
            SUM ( t1."UL_EMI_Denum_Ono" ) AS "G2_UL_EMI_DENUM",
            SUM ( t1."SD to TCH Success Rate (%)" ) AS "G2_SD_TO_TCH_SR",
            '1' AS "DENUMBY1" 
          FROM
            "measDy2g" t1
            INNER JOIN ref_cell_2g tref ON tref.siteid_cellid = CONCAT (
            CASE
                
                WHEN SUBSTRING ( t1."BTS Name" :: TEXT, 2, 1 ) IN ( '_', '-' ) THEN
                SUBSTRING ( t1."BTS Name" :: TEXT, 3, 6 ) ELSE SUBSTRING ( t1."BTS Name" :: TEXT, 1, 6 ) 
              END,
              '_',
              t1."Cell Identity" 
            ) 
        WHERE
            t1."Begin Time" >= ${formattedTgl1} :: TIMESTAMP 
            AND t1."Begin Time" <= ${formattedTgl2} :: TIMESTAMP 
            ${searchByCondition}
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

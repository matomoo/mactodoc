// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v2 } from "../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fieldToAggregate = searchParams.get("fieldToAggregate") || "---";
  const searchByParams = searchParams.get(fieldToAggregate) || "---";

  const tgl_1 = searchParams.get("tgl_1");
  const tgl_2 = searchParams.get("tgl_2");

  // console.log({ searchByParams, fieldToAggregate });

  if (!tgl_1 || !tgl_2 || fieldToAggregate === "---") {
    return NextResponse.json({ error: "Both tgl_1 and tgl_2 parameters are required" }, { status: 400 });
  }

  let finalFieldToAggregate = fieldToAggregate;
  if (fieldToAggregate === "siteid") {
    finalFieldToAggregate = "tref.siteid";
  }

  let formattedTgl1: string;
  let formattedTgl2: string;

  try {
    formattedTgl1 = new Date(tgl_1).toISOString();
    formattedTgl2 = new Date(tgl_2).toISOString();
    const searchValues = searchByParams.split(",").filter((c) => c.trim() !== "");

    // biome-ignore lint/suspicious/noExplicitAny: <none>
    let searchByCondition: any;
    if (searchByParams === "---" || searchByParams === "All" || searchValues.length === 0) {
      searchByCondition = sql``;
    } else if (searchValues.length === 1) {
      searchByCondition = sql`AND ${sql.raw(finalFieldToAggregate)} = ${searchValues[0].trim()}`;
    } else {
      const multiSearchList = searchValues.map((c) => `'${c.trim()}'`).join(",");
      searchByCondition = sql`AND ${sql.raw(finalFieldToAggregate)} IN (${sql.raw(multiSearchList)})`;
    }

    const result = await db_conn_v2.execute<Data2G4GModel>(sql`
        SELECT
            t1."Begin Time" AS "BEGIN_TIME",
            ${sql.raw(finalFieldToAggregate)} AS "SITEID",
            ((SUM(t1."EDGE Payload (Mbyte)_ono") + SUM(t1."GPRS Payload (Mbyte)_ono")) / 1024) AS "TOTAL_PAYLOAD_GB",
            (SUM(t1."TCH Traffic (Erl)_ono")) AS "TOTAL_TRAFFIC_ERL",
            '2G' AS "Tech"
        FROM
            "measDy2g" t1
            INNER JOIN ref_cell_2g tref ON tref.siteid_cellid = CONCAT(
                CASE
                    WHEN SUBSTRING(t1."BTS Name"::TEXT, 2, 1) IN ('_', '-') THEN
                        SUBSTRING(t1."BTS Name"::TEXT, 3, 6)
                    ELSE
                        SUBSTRING(t1."BTS Name"::TEXT, 1, 6)
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
            ${sql.raw(finalFieldToAggregate)}

        UNION ALL

        SELECT
            t1."Begin Time" AS "BEGIN_TIME",
            ${sql.raw(finalFieldToAggregate)} AS "SITEID",
            (SUM(t1."4G Payload (MByte) AMQ") / 1024) AS "TOTAL_PAYLOAD_GB",
            (SUM(t1."Traffic_VoLTE_(erl) AMQ")) AS "TOTAL_TRAFFIC_ERL",
            '4G' AS "Tech"
        FROM
            "measDy4g" t1
            INNER JOIN ref_cell_4g tref ON tref.siteid_cellid = CONCAT(
                CASE
                    WHEN SUBSTRING(t1."Cell Name"::TEXT, 2, 1) IN ('_', '-') THEN
                        SUBSTRING(t1."Cell Name"::TEXT, 3, 6)
                    ELSE
                        SUBSTRING(t1."Cell Name"::TEXT, 1, 6)
                END,
                '_',
                t1."cellId"
            )
        WHERE
            t1."Begin Time" >= ${formattedTgl1} :: TIMESTAMP
            AND t1."Begin Time" <= ${formattedTgl2} :: TIMESTAMP
            ${searchByCondition}
        GROUP BY
            t1."Begin Time",
            ${sql.raw(finalFieldToAggregate)}

        UNION ALL

        SELECT
            t1."Begin Time" AS "BEGIN_TIME",
            ${sql.raw(finalFieldToAggregate)} AS "SITEID",
            (SUM(t1."Payload(GB)_LW") / 1024) AS "TOTAL_PAYLOAD_GB",
            0 AS "TOTAL_TRAFFIC_ERL",
            '5G' AS "Tech"
        FROM
            "measDy5g" t1
            INNER JOIN ref_cell_5g tref ON tref.siteid_cellid = CONCAT(
                CASE
                    WHEN SUBSTRING(t1."NRPhysicalCellDU Name"::TEXT, 2, 1) IN ('_', '-') THEN
                        SUBSTRING(t1."NRPhysicalCellDU Name"::TEXT, 3, 6)
                    ELSE
                        SUBSTRING(t1."NRPhysicalCellDU Name"::TEXT, 1, 6)
                END,
                '_',
                t1."nrPhysicalCellDUId"
            )
        WHERE
            t1."Begin Time" >= ${formattedTgl1} :: TIMESTAMP
            AND t1."Begin Time" <= ${formattedTgl2} :: TIMESTAMP
            ${searchByCondition}
        GROUP BY
            t1."Begin Time",
            ${sql.raw(finalFieldToAggregate)}

        ORDER BY
            "BEGIN_TIME",
            "Tech";
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

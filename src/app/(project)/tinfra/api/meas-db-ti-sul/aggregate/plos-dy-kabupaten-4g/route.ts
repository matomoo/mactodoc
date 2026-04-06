// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v2 } from "../../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tgl_1 = searchParams.get("tgl_1");
  const tgl_2 = searchParams.get("tgl_2");
  const fieldToAggregate = searchParams.get("fieldToAggregate") || "---";
  const searchByParams = searchParams.get(fieldToAggregate) || "---";

  if (!tgl_1 || !tgl_2) {
    return NextResponse.json({ error: "Both tgl_1 and tgl_2 parameters are required" }, { status: 400 });
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
      searchByCondition = sql`tref.${sql.raw(fieldToAggregate)} = ${searchValues[0].trim()}`;
    } else {
      const multiSearchList = searchValues.map((c) => `'${c.trim()}'`).join(",");
      searchByCondition = sql`tref.${sql.raw(fieldToAggregate)} IN (${sql.raw(multiSearchList)})`;
    }

    const result = await db_conn_v2.execute<Data2G4GModel>(sql`
            WITH site_metrics AS (
              SELECT
                t1."Begin Time",
                tref.siteid,
                tref.${sql.raw(fieldToAggregate)},
                AVG ( t1."Packet Loss Rate of TWAMP Detecting Link 1630557083064" ) * 100 AS "Avg Packet Loss Rate",
              CASE
                  WHEN AVG ( t1."Packet Loss Rate of TWAMP Detecting Link 1630557083064" ) * 100 > 0.1 THEN
                  'FAIL' ELSE 'PASS' 
                END AS "Remark" 
              FROM
                "measTwamp4g" t1
                INNER JOIN ref_cell_4g tref ON tref.siteid = (
                CASE
                    
                    WHEN SUBSTRING ( t1."Managed Element" :: TEXT, 2, 1 ) IN ( '_', '-' ) THEN
                    SUBSTRING ( t1."Managed Element" :: TEXT, 3, 6 ) ELSE SUBSTRING ( t1."Managed Element" :: TEXT, 1, 6 ) 
                  END 
                  ) 
                WHERE
                  ${searchByCondition}
                    AND t1."Begin Time" >= ${formattedTgl1} 
                    AND t1."Begin Time" <= ${formattedTgl2} 
                GROUP BY
                  t1."Begin Time",
                  tref.siteid,
                  tref.${sql.raw(fieldToAggregate)} 
                ) SELECT
                "Begin Time",
                ${sql.raw(fieldToAggregate)} AS "aggrby",
                SUM ( CASE WHEN "Remark" = 'FAIL' THEN 1 ELSE 0 END ) AS "FAIL Count",
                AVG ( "Avg Packet Loss Rate" ) AS "Avg Packet Loss Rate"
              FROM
                site_metrics 
              GROUP BY
                "Begin Time",
                ${sql.raw(fieldToAggregate)} 
            ORDER BY
              "Begin Time";
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

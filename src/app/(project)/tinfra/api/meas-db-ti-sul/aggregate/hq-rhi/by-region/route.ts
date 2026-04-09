// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v2 } from "../../../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fieldToAggregate = searchParams.get("fieldToAggregate") || "---";
  const searchByParams = searchParams.get(fieldToAggregate) || "---";
  const searchByParams2 = searchParams.get("level") || "---";
  const searchByParams3 = searchParams.get("provider") || "---";

  // console.log("fieldToAggregate", fieldToAggregate);
  // console.log("searchByParams", searchByParams);

  const tgl_1 = searchParams.get("tgl_1");
  const tgl_2 = searchParams.get("tgl_2");

  if (!tgl_1 || !tgl_2) {
    return NextResponse.json({ error: "Both tgl_1 and tgl_2 parameters are required" }, { status: 400 });
  }

  // let formattedTgl1: string;
  // let formattedTgl2: string;

  try {
    // formattedTgl1 = new Date(tgl_1).toISOString();
    // formattedTgl2 = new Date(tgl_2).toISOString();
    const searchValues = searchByParams.split(",").filter((c) => c.trim() !== "");

    // biome-ignore lint/suspicious/noExplicitAny: <none>
    let searchByCondition: any;
    if (searchByParams === "---" || searchByParams === "All" || searchValues.length === 0) {
      searchByCondition = sql``;
    } else if (searchValues.length === 1) {
      searchByCondition = sql`AND t1.location = ${searchValues[0].trim()}`;
    } else {
      const multiSearchList = searchValues.map((c) => `'${c.trim()}'`).join(",");
      searchByCondition = sql`AND t1.location IN (${sql.raw(multiSearchList)})`;
    }

    const result = await db_conn_v2.execute<Data2G4GModel>(sql`
          WITH tref_agg AS (
              SELECT DISTINCT ON (siteid)
                  siteid,
                  kabupaten,
                  nop,
                  kecamatan,
                  region 
              FROM ref_cell_4g
              ORDER BY siteid
          ),
          aggregated AS (
              SELECT
                  t1.weeknum AS yearweek,
                  t1.regional AS region,
                  COUNT(CASE WHEN t1.tech = '2g' AND t1.remark_week = 'FAIL' THEN 1 END) AS FAIL2G,
                  COUNT(CASE WHEN t1.tech = '2g' AND t1.remark_week = 'GOOD' THEN 1 END) AS GOOD2G,
                  COUNT(CASE WHEN t1.tech = '2g' THEN 1 END) AS TOTAL2G,
                  COUNT(CASE WHEN t1.tech = '4g' AND t1.remark_week = 'FAIL' THEN 1 END) AS FAIL4G,
                  COUNT(CASE WHEN t1.tech = '4g' AND t1.remark_week = 'GOOD' THEN 1 END) AS GOOD4G,
                  COUNT(CASE WHEN t1.tech = '4g' THEN 1 END) AS TOTAL4G,
                  COUNT(CASE WHEN t1.tech = '5g' AND t1.remark_week = 'FAIL' THEN 1 END) AS FAIL5G,
                  COUNT(CASE WHEN t1.tech = '5g' AND t1.remark_week = 'GOOD' THEN 1 END) AS GOOD5G,
                  COUNT(CASE WHEN t1.tech = '5g' THEN 1 END) AS TOTAL5G,
                  COUNT(CASE WHEN t1.remark_week = 'FAIL' THEN 1 END) AS TOTALFAIL,
                  COUNT(CASE WHEN t1.remark_week = 'GOOD' THEN 1 END) AS TOTALGOOD
              FROM
                  raw_rhi t1
                  LEFT JOIN tref_agg tref ON t1.site_id = tref.siteid 
              GROUP BY
                  t1.weeknum, t1.regional
          )
          SELECT
              agg.*,
              (agg.TOTALFAIL + agg.TOTALGOOD) AS TOTALALL,
              ROUND(1.0 * agg.TOTALGOOD / NULLIF(agg.TOTALFAIL + agg.TOTALGOOD, 0), 4) AS PERCENT_RHI_ALL,
              target.target_rhi
          FROM
              aggregated agg
              LEFT JOIN target_kpi_hq target ON agg.yearweek = target.year_week
          ORDER BY
              agg.yearweek;
        `);

    // console.log("Search params:", { fieldToAggregate, searchByParams, tgl_1, tgl_2 });
    // console.log("Search condition:", _searchByCondition);
    // console.log("Result:", result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

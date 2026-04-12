// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v2 } from "../../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fieldToAggregate = searchParams.get("fieldToAggregate") || "---";
  const searchByParams = searchParams.get(fieldToAggregate) || "---";
  const searchByYearWeek = searchParams.get("yearweek") || "---";
  const searchByValueLocation = searchParams.get("valueLocation") || "---";

  // const searchByParams2 = searchParams.get("level") || "---";
  // const searchByParams3 = searchParams.get("provider") || "---";

  const aggregateColumn =
    fieldToAggregate === "region"
      ? "regional"
      : fieldToAggregate === "kabupaten"
        ? "t1.kabupaten"
        : fieldToAggregate === "site_id"
          ? "site_id"
          : "no_data";

  const tgl_1 = searchParams.get("yearweek");
  const tgl_2 = searchParams.get("yearweek");

  if (!tgl_1 || !tgl_2) {
    return NextResponse.json({ error: "Both tgl_1 and tgl_2 parameters are required" }, { status: 400 });
  }

  try {
    const searchValues = searchByValueLocation.split(",").filter((c) => c.trim() !== "");

    // biome-ignore lint/suspicious/noExplicitAny: <none>
    let searchByCondition: any;
    let searchByCondition2: any;
    if (searchByValueLocation === "---" || searchByValueLocation === "All" || searchValues.length === 0) {
      searchByCondition = sql``;
    } else if (searchValues.length === 1) {
      searchByCondition = sql`${sql.raw(aggregateColumn)} = ${searchValues[0].trim()}`;
    } else {
      const multiSearchList = searchValues.map((c) => `'${c.trim()}'`).join(",");
      searchByCondition = sql`${sql.raw(aggregateColumn)} IN (${sql.raw(multiSearchList)})`;
    }

    if (searchByYearWeek === "All") {
      searchByCondition2 = sql``;
    } else {
      searchByCondition2 = sql`AND weeknum = ${searchByYearWeek}`;
    }

    // console.log("hq-rhi > debugging values:", {
    //   fieldToAggregate,
    //   searchByYearWeek,
    //   searchByParams,
    //   searchByValueLocation,
    //   aggregateColumn,
    //   searchValues,
    //   searchByCondition: searchByCondition.toString(),
    // });

    const result = await db_conn_v2.execute<Data2G4GModel>(sql`
          WITH params AS (
              SELECT ${sql.raw(searchByYearWeek)} AS selected_week
          ),
          tref_agg AS (
              SELECT DISTINCT ON (kabupaten)
                  siteid,
                  kabupaten,
                  nop,
                  kecamatan,
                  region
              FROM ref_cell_4g
              ORDER BY kabupaten
          ),
          week_scope AS (
              SELECT DISTINCT weeknum
              FROM raw_rhi
              WHERE weeknum <= (SELECT selected_week FROM params)
                AND ${searchByCondition}
              ORDER BY weeknum DESC
              LIMIT 2
          ),
          prev_week AS (
              SELECT MIN(weeknum) AS year_week FROM week_scope
          ),
          is_valid AS (
              SELECT
                  CASE
                      WHEN COUNT(DISTINCT weeknum) >= 2
                      AND MIN(weeknum) < (SELECT selected_week FROM params)
                      THEN TRUE
                      ELSE FALSE
                  END AS valid
              FROM week_scope
          ),
          aggregated AS (
              SELECT
                  t1.weeknum                                                                        AS yearweek,
                  t1.regional                                                                       AS region,
                  COUNT(CASE WHEN t1.tech = '2g' AND t1.remark_week = 'FAIL' THEN 1 END)           AS FAIL2G,
                  COUNT(CASE WHEN t1.tech = '2g' AND t1.remark_week = 'GOOD' THEN 1 END)           AS GOOD2G,
                  COUNT(CASE WHEN t1.tech = '2g' THEN 1 END)                                       AS TOTAL2G,
                  COUNT(CASE WHEN t1.tech = '4g' AND t1.remark_week = 'FAIL' THEN 1 END)           AS FAIL4G,
                  COUNT(CASE WHEN t1.tech = '4g' AND t1.remark_week = 'GOOD' THEN 1 END)           AS GOOD4G,
                  COUNT(CASE WHEN t1.tech = '4g' THEN 1 END)                                       AS TOTAL4G,
                  COUNT(CASE WHEN t1.tech = '5g' AND t1.remark_week = 'FAIL' THEN 1 END)           AS FAIL5G,
                  COUNT(CASE WHEN t1.tech = '5g' AND t1.remark_week = 'GOOD' THEN 1 END)           AS GOOD5G,
                  COUNT(CASE WHEN t1.tech = '5g' THEN 1 END)                                       AS TOTAL5G,
                  COUNT(CASE WHEN t1.remark_week = 'FAIL' THEN 1 END)                              AS TOTALFAIL,
                  COUNT(CASE WHEN t1.remark_week = 'GOOD' THEN 1 END)                              AS TOTALGOOD
              FROM raw_rhi t1
              LEFT JOIN tref_agg tref ON t1.kabupaten = tref.kabupaten
              WHERE
                  ${searchByCondition}
                  AND t1.weeknum IN (SELECT weeknum FROM week_scope)
              GROUP BY
                  t1.weeknum, ${sql.raw(aggregateColumn)}
          ),
          with_pct AS (
              SELECT
                  agg.*,
                  (agg.TOTALFAIL + agg.TOTALGOOD)                                                                AS totalall,
                  ROUND((1.0 * agg.TOTALGOOD / NULLIF(agg.TOTALFAIL + agg.TOTALGOOD, 0) * 100)::NUMERIC, 4)     AS percent_rhi_all,
                  ROUND((target.target_rhi * 100)::NUMERIC, 4)                                                  AS target_rhi
              FROM aggregated agg
              LEFT JOIN target_kpi_hq target ON agg.yearweek = target.year_week
          ),
          wow AS (
              SELECT
                  *,
                  ROUND(LAG(percent_rhi_all) OVER (PARTITION BY region ORDER BY yearweek)::NUMERIC, 4) AS prev_percent_rhi_all,
                  ROUND((percent_rhi_all - LAG(percent_rhi_all) OVER (
                      PARTITION BY region ORDER BY yearweek
                  ))::NUMERIC, 4)                                                                       AS wow_diff
              FROM with_pct
          )
          SELECT
              w.yearweek,
              w.region,
              w.FAIL2G, w.GOOD2G, w.TOTAL2G,
              w.FAIL4G, w.GOOD4G, w.TOTAL4G,
              w.FAIL5G, w.GOOD5G, w.TOTAL5G,
              w.TOTALFAIL, w.TOTALGOOD,
              w.totalall,
              w.percent_rhi_all,
              w.target_rhi,

              CASE WHEN (SELECT valid FROM is_valid) THEN (SELECT year_week FROM prev_week) ELSE NULL END  AS prev_yearweek,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.prev_percent_rhi_all                ELSE NULL END  AS prev_percent_rhi_all,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.wow_diff                            ELSE NULL END  AS wow_diff

          FROM wow w
          WHERE w.yearweek = (SELECT selected_week FROM params)
          ORDER BY w.yearweek;
        `);

    // console.log("Result:", result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

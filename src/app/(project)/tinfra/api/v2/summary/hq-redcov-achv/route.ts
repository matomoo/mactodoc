// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v2 } from "../../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fieldToAggregate = searchParams.get("fieldToAggregate") || "---";
  const searchByParams = searchParams.get(fieldToAggregate) || "---";
  const searchByLevel = searchParams.get("level") || "---";
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

          week_scope AS (
            SELECT DISTINCT
              "Week" as weeknum
            FROM
              raw_redcov 
            WHERE
              "Week" <= ( SELECT selected_week FROM params ) 
              AND region = 'SULAWESI' 
            ORDER BY
              "Week" DESC 
              LIMIT 2 
            ),
            prev_week AS ( SELECT MIN ( weeknum ) AS weeknum FROM week_scope ),
            is_valid AS (
            SELECT
            CASE
                
              WHEN COUNT
                ( DISTINCT weeknum ) >= 2 
                AND MIN ( weeknum ) < ( SELECT selected_week FROM params ) THEN
                TRUE ELSE FALSE 
              END AS VALID 
              FROM
                week_scope 
              ),
              base AS (
              SELECT
                t1."Week",
                SUM ( t1."RED OPTIM" ) AS red_optim_cells_count,
                SUM ( t1.total_geohash7 ) AS all_cells_count,
                '0.78' AS target_kpi 
              FROM
                raw_redcov t1 
              WHERE
                t1.region = 'SULAWESI' 
                AND t1."Week" IN ( SELECT weeknum FROM week_scope ) 
              GROUP BY
                t1."Week" 
              ORDER BY
                t1."Week" 
              ),
              with_pct AS (
              SELECT
                *,
                ROUND(
                  red_optim_cells_count :: NUMERIC / NULLIF ( all_cells_count, 0 ) * 100,
                  2 
                ) AS red_optim_cells_pct 
              FROM
                base 
              ),
              wow AS (
              SELECT
                *,
                ROUND(
                  LAG ( red_optim_cells_pct ) OVER ( ORDER BY "Week" ) :: NUMERIC,
                  2 
                ) AS prev_red_optim_cells_pct,
                ROUND(
                  (
                    red_optim_cells_pct - LAG ( red_optim_cells_pct ) OVER ( ORDER BY "Week" ) 
                  ) :: NUMERIC,
                  2 
                ) AS wow_diff 
              FROM
                with_pct 
              ) SELECT
              w."Week",
              w.red_optim_cells_count,
              w.all_cells_count,
              w.target_kpi,
              w.red_optim_cells_pct,
            CASE
                
                WHEN ( SELECT VALID FROM is_valid ) THEN
                ( SELECT weeknum FROM prev_week ) ELSE NULL 
              END AS prev_weeknum,
            CASE
                
                WHEN ( SELECT VALID FROM is_valid ) THEN
                w.prev_red_optim_cells_pct ELSE NULL 
              END AS prev_red_optim_cells_pct,
            CASE
                
                WHEN ( SELECT VALID FROM is_valid ) THEN
                w.wow_diff ELSE NULL 
              END AS wow_red_optim_cells_pct 
            FROM
              wow w 
          WHERE
            w."Week" = ( SELECT selected_week FROM params );
        `);

    // console.log("Result:", result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

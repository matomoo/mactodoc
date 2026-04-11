// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v2 } from "../../../../_drizzle/db_ti_sul";
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

  // const tgl_1 = searchParams.get("tgl_1");
  // const tgl_2 = searchParams.get("tgl_2");

  // if (!tgl_1 || !tgl_2) {
  //   return NextResponse.json({ error: "Both tgl_1 and tgl_2 parameters are required" }, { status: 400 });
  // }

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
          WITH params AS (
              SELECT 202612 AS selected_week
          ),
          base AS (
              SELECT
                  t1.LEVEL,
                  t1.LOCATION,
                  t1.provider,
                  t1.metric,
                  t1.year_week,
                  SUM(t1."rank")                                  AS "rank",
                  AVG(t1.percentage)                              AS percentage,
                  COUNT(CASE WHEN t1.status = 'Lose' THEN 1 END) AS "Lose",
                  COUNT(CASE WHEN t1.status = 'Win'  THEN 1 END) AS "Win",
                  '11' AS target_kpi
              FROM raw_tutela t1
              WHERE
                  t1.LEVEL     = 'Region'
                  AND t1.LOCATION  = 'SULAWESI'
                  AND t1.rank IS NOT NULL
                  AND t1.year_week IN (
                      SELECT DISTINCT year_week
                      FROM raw_tutela
                      WHERE year_week <= (SELECT selected_week FROM params)
                      ORDER BY year_week DESC
                      LIMIT 2
                  )
              GROUP BY
                  t1.LEVEL, t1.LOCATION, t1.provider, t1.metric, t1.year_week
          ),

          last_week AS (
              SELECT selected_week AS year_week FROM params
          ),

          prev_week AS (
              SELECT
                  MIN(year_week)                          AS year_week,
                  -- valid only if there are 2 distinct weeks AND prev != selected
                  CASE
                      WHEN COUNT(DISTINCT year_week) >= 2
                      AND MIN(year_week) < (SELECT selected_week FROM params)
                      THEN TRUE
                      ELSE FALSE
                  END                                     AS is_valid
              FROM base
          ),

          -- 1. % Achievement → selected week only
          percentage_achievement AS (
              SELECT
                  b.year_week,
                  b.provider,
                  b.metric,
                  ROUND(AVG(b.percentage)::NUMERIC, 2)  AS avg_percentage,
                  MAX(b.target_kpi::FLOAT)              AS target_kpi
              FROM base b
              WHERE b.year_week = (SELECT year_week FROM last_week)
              GROUP BY b.year_week, b.provider, b.metric
          ),

          -- 2. Bar Chart Win/Lose → selected week only
          win_lose_chart AS (
              SELECT
                  b.year_week,
                  b.provider,
                  b.metric,
                  SUM(b."Win")  AS total_win,
                  SUM(b."Lose") AS total_lose
              FROM base b
              WHERE b.year_week = (SELECT year_week FROM last_week)
              GROUP BY b.year_week, b.provider, b.metric
          ),

          -- 3. WoW → LAG() across selected + prev week
          wow AS (
              SELECT
                  provider,
                  metric,
                  year_week,
                  ROUND(percentage::NUMERIC, 2) AS current_pct,
                  ROUND(LAG(percentage) OVER (
                      PARTITION BY provider, metric
                      ORDER BY year_week
                  )::NUMERIC, 2)                AS prev_pct,
                  ROUND((percentage - LAG(percentage) OVER (
                      PARTITION BY provider, metric
                      ORDER BY year_week
                  ))::NUMERIC, 2)               AS wow_diff
              FROM base
          ),

          -- 4. Status Rank → LAG() across selected + prev week
          status_rank AS (
              SELECT
                  b.year_week,
                  b.provider,
                  b.metric,
                  SUM(b."rank") AS total_rank,
                  LAG(SUM(b."rank")) OVER (
                      PARTITION BY b.provider, b.metric
                      ORDER BY b.year_week
                  )             AS prev_rank,
                  CASE
                      WHEN SUM(b."Win") > SUM(b."Lose") THEN 'Win'
                      ELSE 'Lose'
                  END           AS overall_status,
                  LAG(CASE
                      WHEN SUM(b."Win") > SUM(b."Lose") THEN 'Win'
                      ELSE 'Lose'
                  END) OVER (
                      PARTITION BY b.provider, b.metric
                      ORDER BY b.year_week
                  )             AS prev_status
              FROM base b
              GROUP BY b.year_week, b.provider, b.metric
          )

          -- Final SELECT
          SELECT
              lw.year_week                                                AS year_week,
              -- NULL if prev week is not valid/adjacent
              CASE WHEN (SELECT is_valid FROM prev_week)
                  THEN (SELECT year_week FROM prev_week)
                  ELSE NULL
              END                                                         AS prev_year_week,
              pa.provider,
              pa.metric,

              -- % Achievement
              pa.avg_percentage,
              pa.target_kpi,

              -- Bar Chart
              wl.total_win,
              wl.total_lose,

              -- WoW (NULL if prev week missing/non-adjacent)
              CASE WHEN (SELECT is_valid FROM prev_week) THEN w.current_pct  ELSE NULL END AS wow_current_pct,
              CASE WHEN (SELECT is_valid FROM prev_week) THEN w.prev_pct     ELSE NULL END AS wow_prev_pct,
              CASE WHEN (SELECT is_valid FROM prev_week) THEN w.wow_diff     ELSE NULL END AS wow_diff,

              -- Status Rank (NULL if prev week missing/non-adjacent)
              sr.total_rank                                               AS current_rank,
              CASE WHEN (SELECT is_valid FROM prev_week) THEN sr.prev_rank   ELSE NULL END AS prev_rank,
              sr.overall_status                                           AS current_status,
              CASE WHEN (SELECT is_valid FROM prev_week) THEN sr.prev_status ELSE NULL END AS prev_status,
              
              -- Rank Remark
              CASE
              WHEN (SELECT is_valid FROM prev_week) IS FALSE OR sr.prev_rank IS NULL
                  THEN CONCAT('Rank ', sr.total_rank)
              WHEN sr.total_rank = sr.prev_rank
                  THEN CONCAT('Rank ', sr.total_rank)
              ELSE
                  CONCAT('Rank ', sr.prev_rank, ' to ', sr.total_rank)
          END AS rank_remark

          FROM last_week lw
          JOIN percentage_achievement pa  ON pa.year_week = lw.year_week
          JOIN win_lose_chart          wl ON wl.year_week = lw.year_week
                                          AND wl.provider = pa.provider
                                          AND wl.metric   = pa.metric
          JOIN wow                     w  ON w.year_week  = lw.year_week
                                          AND w.provider  = pa.provider
                                          AND w.metric    = pa.metric
          JOIN status_rank             sr ON sr.year_week = lw.year_week
                                          AND sr.provider = pa.provider
                                          AND sr.metric   = pa.metric

          ORDER BY pa.provider, pa.metric;
        `);

    // console.log("Search params:", { fieldToAggregate, searchByParams, tgl_1, tgl_2 });
    // console.log("Search condition:", _searchByCondition);
    // console.log("Result:", result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

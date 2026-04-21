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
              SELECT DISTINCT yearweek
              FROM raw_ookla
              WHERE yearweek <= (SELECT selected_week FROM params)
                AND region = ${searchByValueLocation.trim()} 
              ORDER BY yearweek DESC
              LIMIT 2
          ),

          prev_week AS (
              SELECT MIN(yearweek) AS yearweek FROM week_scope
          ),

          is_valid AS (
              SELECT
                  CASE
                      WHEN COUNT(DISTINCT yearweek) >= 2
                      AND MIN(yearweek) < (SELECT selected_week FROM params)
                      THEN TRUE
                      ELSE FALSE
                  END AS valid
              FROM week_scope
          ),

          aggregated AS (
              SELECT
                  o.yearweek,
                  o.region,
                  o.tech,
                  o.operator,

                  ROUND(AVG(o.connectivity_score)::NUMERIC, 4)        AS avg_connectivity_score,
                  ROUND(AVG(o.rank_connectivity)::NUMERIC, 2)         AS avg_rank_connectivity,

                  ROUND(AVG(o.speed_score)::NUMERIC, 4)               AS avg_speed_score,
                  ROUND(AVG(o.rank_speed)::NUMERIC, 2)                AS avg_rank_speed,

                  ROUND(AVG(o.video_score)::NUMERIC, 4)               AS avg_video_score,
                  ROUND(AVG(o.rank_video)::NUMERIC, 2)                AS avg_rank_video,

                  ROUND(AVG(o.game_score)::NUMERIC, 4)                AS avg_game_score,
                  ROUND(AVG(o.rank_game)::NUMERIC, 2)                 AS avg_rank_game,

                  ROUND(AVG(o.web_score)::NUMERIC, 4)                 AS avg_web_score,
                  ROUND(AVG(o.rank_web)::NUMERIC, 2)                  AS avg_rank_web,
                  ROUND(AVG(o.page_load_time_percent)::NUMERIC, 4)    AS avg_page_load_time_percent,
                  ROUND(AVG(o.avg_val_web_page_load_time)::NUMERIC, 4) AS avg_web_page_load_time

              FROM raw_ookla o
              WHERE o.yearweek IN (SELECT yearweek FROM week_scope)
                AND o.region = ${searchByValueLocation.trim()}
                AND o.tech != 'ALL'
              GROUP BY
                  o.yearweek, o.region, o.tech, o.operator
          ),

          wow AS (
              SELECT
                  *,

                  ROUND(LAG(avg_connectivity_score) OVER (
                      PARTITION BY region, tech, operator ORDER BY yearweek
                  )::NUMERIC, 4)                                                                              AS prev_connectivity_score,
                  ROUND((avg_connectivity_score - LAG(avg_connectivity_score) OVER (
                      PARTITION BY region, tech, operator ORDER BY yearweek
                  ))::NUMERIC, 4)                                                                             AS wow_connectivity_score,

                  ROUND(LAG(avg_speed_score) OVER (
                      PARTITION BY region, tech, operator ORDER BY yearweek
                  )::NUMERIC, 4)                                                                              AS prev_speed_score,
                  ROUND((avg_speed_score - LAG(avg_speed_score) OVER (
                      PARTITION BY region, tech, operator ORDER BY yearweek
                  ))::NUMERIC, 4)                                                                             AS wow_speed_score,

                  ROUND(LAG(avg_video_score) OVER (
                      PARTITION BY region, tech, operator ORDER BY yearweek
                  )::NUMERIC, 4)                                                                              AS prev_video_score,
                  ROUND((avg_video_score - LAG(avg_video_score) OVER (
                      PARTITION BY region, tech, operator ORDER BY yearweek
                  ))::NUMERIC, 4)                                                                             AS wow_video_score,

                  ROUND(LAG(avg_game_score) OVER (
                      PARTITION BY region, tech, operator ORDER BY yearweek
                  )::NUMERIC, 4)                                                                              AS prev_game_score,
                  ROUND((avg_game_score - LAG(avg_game_score) OVER (
                      PARTITION BY region, tech, operator ORDER BY yearweek
                  ))::NUMERIC, 4)                                                                             AS wow_game_score,

                  ROUND(LAG(avg_web_score) OVER (
                      PARTITION BY region, tech, operator ORDER BY yearweek
                  )::NUMERIC, 4)                                                                              AS prev_web_score,
                  ROUND((avg_web_score - LAG(avg_web_score) OVER (
                      PARTITION BY region, tech, operator ORDER BY yearweek
                  ))::NUMERIC, 4)                                                                             AS wow_web_score,

                  ROUND(LAG(avg_page_load_time_percent) OVER (
                      PARTITION BY region, tech, operator ORDER BY yearweek
                  )::NUMERIC, 4)                                                                              AS prev_page_load_time_percent,
                  ROUND((avg_page_load_time_percent - LAG(avg_page_load_time_percent) OVER (
                      PARTITION BY region, tech, operator ORDER BY yearweek
                  ))::NUMERIC, 4)                                                                             AS wow_page_load_time_percent,

                  ROUND(LAG(avg_web_page_load_time) OVER (
                      PARTITION BY region, tech, operator ORDER BY yearweek
                  )::NUMERIC, 4)                                                                              AS prev_web_page_load_time,
                  ROUND((avg_web_page_load_time - LAG(avg_web_page_load_time) OVER (
                      PARTITION BY region, tech, operator ORDER BY yearweek
                  ))::NUMERIC, 4)                                                                             AS wow_web_page_load_time

              FROM aggregated
          )

          SELECT
              w.yearweek,
              w.region,
              w.tech,
              w.operator,

              w.avg_connectivity_score,
              w.avg_rank_connectivity,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.prev_connectivity_score   ELSE NULL END AS prev_connectivity_score,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.wow_connectivity_score    ELSE NULL END AS wow_connectivity_score,

              w.avg_speed_score,
              w.avg_rank_speed,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.prev_speed_score          ELSE NULL END AS prev_speed_score,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.wow_speed_score           ELSE NULL END AS wow_speed_score,

              w.avg_video_score,
              w.avg_rank_video,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.prev_video_score          ELSE NULL END AS prev_video_score,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.wow_video_score           ELSE NULL END AS wow_video_score,

              w.avg_game_score,
              w.avg_rank_game,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.prev_game_score           ELSE NULL END AS prev_game_score,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.wow_game_score            ELSE NULL END AS wow_game_score,

              w.avg_web_score,
              w.avg_rank_web,
              w.avg_page_load_time_percent,
              w.avg_web_page_load_time,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.prev_web_score            ELSE NULL END AS prev_web_score,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.wow_web_score             ELSE NULL END AS wow_web_score,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.prev_page_load_time_percent ELSE NULL END AS prev_page_load_time_percent,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.wow_page_load_time_percent  ELSE NULL END AS wow_page_load_time_percent,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.prev_web_page_load_time   ELSE NULL END AS prev_web_page_load_time,
              CASE WHEN (SELECT valid FROM is_valid) THEN w.wow_web_page_load_time    ELSE NULL END AS wow_web_page_load_time,

              CASE WHEN (SELECT valid FROM is_valid) THEN (SELECT yearweek FROM prev_week) ELSE NULL END AS prev_yearweek

          FROM wow w
          WHERE w.yearweek = (SELECT selected_week FROM params)
          ORDER BY w.region, w.tech, w.operator;
        `);

    // console.log("Result:", result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

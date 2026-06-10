// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v1 } from "@/app/(project)/tinfra/_drizzle/db_mdoc";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const siteid = searchParams.get("siteid");
  const band = searchParams.get("band");
  const city = searchParams.get("city");
  const beforeDay1 = searchParams.get("beforeDay1");
  const beforeDay2 = searchParams.get("beforeDay2");
  const beforeDay3 = searchParams.get("beforeDay3");
  const afterDay1 = searchParams.get("afterDay1");
  const afterDay2 = searchParams.get("afterDay2");
  const afterDay3 = searchParams.get("afterDay3");

  if (
    !siteid ||
    !band ||
    !city ||
    !beforeDay1 ||
    !beforeDay2 ||
    !beforeDay3 ||
    !afterDay1 ||
    !afterDay2 ||
    !afterDay3
  ) {
    return NextResponse.json(
      {
        error:
          "Missing required params: siteid, band, city, beforeDay1, beforeDay2, beforeDay3, afterDay1, afterDay2, afterDay3",
      },
      { status: 400 },
    );
  }

  try {
    const result = await db_conn_v1.execute<Data2G4GModel>(sql`
            WITH params AS (
                SELECT
                    ${siteid}::TEXT   AS siteid,
                    ${band}::TEXT     AS band,
                    -- Before period
                    ${beforeDay1}::DATE AS before_day1,
                    ${beforeDay2}::DATE AS before_day2,
                    ${beforeDay3}::DATE AS before_day3,
                    -- After period
                    ${afterDay1}::DATE AS after_day1,
                    ${afterDay2}::DATE AS after_day2,
                    ${afterDay3}::DATE AS after_day3
            ),

            -- 2G Traffic from meas_2g_dy
            traffic_2g AS (
                SELECT
                    -- Before
                    ROUND((SUM(CASE WHEN DATE("Begin Time") = (SELECT before_day1 FROM params)
                        THEN "TCH Traffic (Erlang) NFJ" END))::numeric, 2) AS before_day1,
                    ROUND((SUM(CASE WHEN DATE("Begin Time") = (SELECT before_day2 FROM params)
                        THEN "TCH Traffic (Erlang) NFJ" END))::numeric, 2) AS before_day2,
                    ROUND((SUM(CASE WHEN DATE("Begin Time") = (SELECT before_day3 FROM params)
                        THEN "TCH Traffic (Erlang) NFJ" END))::numeric, 2) AS before_day3,
                    -- After
                    ROUND((SUM(CASE WHEN DATE("Begin Time") = (SELECT after_day1 FROM params)
                        THEN "TCH Traffic (Erlang) NFJ" END))::numeric, 2) AS after_day1,
                    ROUND((SUM(CASE WHEN DATE("Begin Time") = (SELECT after_day2 FROM params)
                        THEN "TCH Traffic (Erlang) NFJ" END))::numeric, 2) AS after_day2,
                    ROUND((SUM(CASE WHEN DATE("Begin Time") = (SELECT after_day3 FROM params)
                        THEN "TCH Traffic (Erlang) NFJ" END))::numeric, 2) AS after_day3
                FROM "public"."meas_2g_dy", params
                WHERE "public"."meas_2g_dy".siteid = params.siteid
                AND DATE("Begin Time") IN (
                        params.before_day1, params.before_day2, params.before_day3,
                        params.after_day1,  params.after_day2,  params.after_day3
                    )
            ),

            -- Combine and compute averages + growth
            combined AS (

                -- 2G Traffic
                SELECT
                    2 as sort,
                    '2G Traffic (Erl)' as kpi,
                    p.before_day1,
                    p.before_day2,
                    p.before_day3,
                    ROUND((p.before_day1 + p.before_day2 + p.before_day3) / 3, 2) as avg_before,
                    p.after_day1,
                    p.after_day2,
                    p.after_day3,
                    ROUND((p.after_day1 + p.after_day2 + p.after_day3) / 3, 2) as avg_after
                FROM traffic_2g p

                UNION ALL

                -- Total Erlang (4G + 2G)
                SELECT
                    3,
                    'Total Traffic (Erl)',
                    t.before_day1,
                    t.before_day2,
                    t.before_day3,
                    ROUND(((t.before_day1) +
                        (t.before_day2) +
                        (t.before_day3)) / 3, 2),
                    t.after_day1,
                    t.after_day2,
                    t.after_day3,
                    ROUND(((t.after_day1) +
                        (t.after_day2) +
                        (t.after_day3)) / 3, 2)
                FROM traffic_2g t
            )

            SELECT
                sort,
                kpi                                                                      AS "KPI",
                before_day1                                                              AS "Day-1 Before",
                before_day2                                                              AS "Day-2 Before",
                before_day3                                                              AS "Day-3 Before",
                avg_before                                                               AS "Average Before",
                after_day1                                                               AS "Day-1 After",
                after_day2                                                               AS "Day-2 After",
                after_day3                                                               AS "Day-3 After",
                avg_after                                                                AS "Average After",
                -- Growth: (after - before) / before * 100
                ROUND(((avg_after - avg_before) /
                NULLIF(avg_before, 0) * 100)::numeric, 2)                              AS "Growth",
                -- Result
                CASE
                    WHEN avg_after >= avg_before THEN 'Improved'
                    ELSE 'Degraded'
                END                                                                      AS "Result"
            FROM combined
            ORDER BY sort;
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

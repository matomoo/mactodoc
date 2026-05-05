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
  const searchByTgl2 = searchParams.get("tgl_2") || "---";

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
            SELECT '${sql.raw(searchByTgl2)}'::date AS selected_date  
        ),

        daily AS (
            SELECT
                "Date"::DATE AS DATE,
                "Kota/Kabupaten" AS kotakab,
                SUM("Total Traffic_(Mio Erlang)") AS traffic,
                SUM("Total Payload_(TB)") AS payload
            FROM raw_productivity
            WHERE "Date"::DATE <= (SELECT selected_date FROM params)
            GROUP BY "Date"::DATE, "Kota/Kabupaten"
        ),
        yoy AS (
            SELECT
                kotakab,
                SUM(CASE WHEN DATE >= DATE_TRUNC('year', (SELECT selected_date FROM params))
                            AND DATE <= (SELECT selected_date FROM params)
                        THEN traffic END) AS ytd_traffic_this_year,
                SUM(CASE WHEN DATE >= DATE_TRUNC('year', (SELECT selected_date FROM params))
                            AND DATE <= (SELECT selected_date FROM params)
                        THEN payload END) AS ytd_payload_this_year,
                SUM(CASE WHEN DATE >= DATE_TRUNC('year', (SELECT selected_date FROM params)) - INTERVAL '1 year'
                            AND DATE <= (SELECT selected_date FROM params) - INTERVAL '1 year'
                        THEN traffic END) AS ytd_traffic_last_year,
                SUM(CASE WHEN DATE >= DATE_TRUNC('year', (SELECT selected_date FROM params)) - INTERVAL '1 year'
                            AND DATE <= (SELECT selected_date FROM params) - INTERVAL '1 year'
                        THEN payload END) AS ytd_payload_last_year
            FROM daily
            GROUP BY kotakab
        ),
        mtd AS (
            SELECT
                kotakab,
                SUM(CASE WHEN DATE >= DATE_TRUNC('month', (SELECT selected_date FROM params))
                            AND DATE <= (SELECT selected_date FROM params)
                        THEN traffic END) AS mtd_traffic_this_year,
                SUM(CASE WHEN DATE >= DATE_TRUNC('month', (SELECT selected_date FROM params))
                            AND DATE <= (SELECT selected_date FROM params)
                        THEN payload END) AS mtd_payload_this_year,
                SUM(CASE WHEN DATE >= DATE_TRUNC('month', (SELECT selected_date FROM params)) - INTERVAL '1 year'
                            AND DATE <= (SELECT selected_date FROM params) - INTERVAL '1 year'
                        THEN traffic END) AS mtd_traffic_last_year,
                SUM(CASE WHEN DATE >= DATE_TRUNC('month', (SELECT selected_date FROM params)) - INTERVAL '1 year'
                            AND DATE <= (SELECT selected_date FROM params) - INTERVAL '1 year'
                        THEN payload END) AS mtd_payload_last_year,
                SUM(CASE WHEN DATE >= DATE_TRUNC('month', (SELECT selected_date FROM params)) - INTERVAL '1 month'
                            AND DATE <= (SELECT selected_date FROM params) - INTERVAL '1 month'
                        THEN traffic END) AS mtd_traffic_prev_month,
                SUM(CASE WHEN DATE >= DATE_TRUNC('month', (SELECT selected_date FROM params)) - INTERVAL '1 month'
                            AND DATE <= (SELECT selected_date FROM params) - INTERVAL '1 month'
                        THEN payload END) AS mtd_payload_prev_month
            FROM daily
            GROUP BY kotakab
        ),
        wow AS (
            SELECT
                kotakab,
                SUM(CASE WHEN DATE > (SELECT selected_date FROM params) - INTERVAL '7 days'
                            AND DATE <= (SELECT selected_date FROM params)
                        THEN traffic END) AS wow_traffic_current,
                SUM(CASE WHEN DATE > (SELECT selected_date FROM params) - INTERVAL '7 days'
                            AND DATE <= (SELECT selected_date FROM params)
                        THEN payload END) AS wow_payload_current,
                SUM(CASE WHEN DATE > (SELECT selected_date FROM params) - INTERVAL '14 days'
                            AND DATE <= (SELECT selected_date FROM params) - INTERVAL '7 days'
                        THEN traffic END) AS wow_traffic_prior,
                SUM(CASE WHEN DATE > (SELECT selected_date FROM params) - INTERVAL '14 days'
                            AND DATE <= (SELECT selected_date FROM params) - INTERVAL '7 days'
                        THEN payload END) AS wow_payload_prior
            FROM daily
            GROUP BY kotakab
        ),
        base AS (
            SELECT
                (SELECT selected_date FROM params) AS selected_date,
                y.kotakab,
                ROUND((y.ytd_payload_this_year / NULLIF(y.ytd_payload_last_year, 0) * 100 - 100)::NUMERIC, 2) AS yoy_payload_growth_pct,
                ROUND((m.mtd_payload_this_year / NULLIF(m.mtd_payload_last_year, 0) * 100 - 100)::NUMERIC, 2) AS mtd_payload_growth_pct,
                ROUND((m.mtd_payload_this_year / NULLIF(m.mtd_payload_prev_month, 0) * 100 - 100)::NUMERIC, 2) AS mtd_this_year_payload_growth_pct,
                ROUND((w.wow_payload_current / NULLIF(w.wow_payload_prior, 0) * 100 - 100)::NUMERIC, 2) AS wow_payload_growth_pct
            FROM yoy y
            JOIN mtd m ON m.kotakab = y.kotakab
            JOIN wow w ON w.kotakab = y.kotakab
        )

        -- Top 20 YTD Payload Growth (Plus)
        SELECT * FROM (
            SELECT 'TOP_PLUS' AS rank_group, ROW_NUMBER() OVER (ORDER BY yoy_payload_growth_pct DESC) AS rank, *
            FROM base
            WHERE yoy_payload_growth_pct IS NOT NULL
            ORDER BY yoy_payload_growth_pct DESC
            LIMIT 20
        ) top_plus

        UNION ALL

        -- Top 20 YTD Payload Growth (Minus)
        SELECT * FROM (
            SELECT 'TOP_MINUS' AS rank_group, ROW_NUMBER() OVER (ORDER BY yoy_payload_growth_pct ASC) AS rank, *
            FROM base
            WHERE yoy_payload_growth_pct IS NOT NULL
            ORDER BY yoy_payload_growth_pct ASC
            LIMIT 20
        ) top_minus;
        `);

    // console.log("Result:", result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

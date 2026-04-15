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
            SELECT DISTINCT week
            FROM raw_rci_unb
            WHERE week <= (SELECT selected_week FROM params)
            AND region = ${searchByValueLocation.trim()}
            ORDER BY week DESC
            LIMIT 2
        ),

        prev_week AS (
            SELECT MIN(week) AS week FROM week_scope
        ),

        is_valid AS (
            SELECT
                CASE
                    WHEN COUNT(DISTINCT week) >= 2
                    AND MIN(week) < (SELECT selected_week FROM params)
                    THEN TRUE
                    ELSE FALSE
                END AS valid
            FROM week_scope
        ),

        rci_agg AS (
            SELECT
                week,
                region,
                COUNT(CASE WHEN "Simplify Remark" = 'Green'      THEN 1 END) AS green_count,
                COUNT(CASE WHEN "Simplify Remark" = 'Investment' THEN 1 END) AS investment_count,
                COUNT(CASE WHEN "Simplify Remark" = 'Operation'  THEN 1 END) AS operation_count,
                COUNT(CASE WHEN "Simplify Remark" = 'Optim'      THEN 1 END) AS optim_count,
                COUNT(CASE WHEN "Simplify Remark" = 'Vendor'     THEN 1 END) AS vendor_count,
                COUNT("Simplify Remark")                                      AS total_simplify_remark,
                ROUND(
                    COUNT(CASE WHEN "Simplify Remark" = 'Optim' THEN 1 END)::NUMERIC
                    / NULLIF(COUNT("Simplify Remark"), 0) * 100, 4
                )                                                             AS pct_achv_rci
            FROM raw_rci_unb
            WHERE week IN (SELECT week FROM week_scope)
            AND region = ${searchByValueLocation.trim()}
            GROUP BY week, region
        ),

        rci_wow AS (
            SELECT
                *,
                ROUND(LAG(pct_achv_rci) OVER (
                    PARTITION BY region ORDER BY week
                )::NUMERIC, 4)                                                AS prev_pct_achv_rci,
                ROUND((pct_achv_rci - LAG(pct_achv_rci) OVER (
                    PARTITION BY region ORDER BY week
                ))::NUMERIC, 4)                                               AS wow_pct_achv_rci
            FROM rci_agg
        ),

        unb_agg AS (
            SELECT
                week,
                region,
                COUNT(CASE WHEN unbalanced_3method = 'balanced'      THEN 1 END) AS balanced_count,
                COUNT(CASE WHEN unbalanced_3method = 'unbalanced_p1' THEN 1 END) AS unbalanced_p1_count,
                COUNT(CASE WHEN unbalanced_3method = 'unbalanced_p2' THEN 1 END) AS unbalanced_p2_count,
                COUNT(CASE WHEN unbalanced_3method = 'unbalanced_p3' THEN 1 END) AS unbalanced_p3_count,
                COUNT(unbalanced_3method)                                         AS total_unbalanced_3method,

                -- P1 breakdown (only rows where unbalanced_3method = 'unbalanced_p1')
                COUNT(CASE WHEN unbalanced_3method = 'unbalanced_p1' AND "Status Final Regional" = 'Unbalance V2 - L18L21 vs L23 >40%' THEN 1 END) AS p1_unbalance_v2_l18l21_vs_l23,
                COUNT(CASE WHEN unbalanced_3method = 'unbalanced_p1' AND "Status Final Regional" = 'Unbalance V1 - L18L21 >30%' THEN 1 END) AS p1_unbalance_v1_l18l21,
                COUNT(CASE WHEN unbalanced_3method = 'unbalanced_p1' AND "Status Final Regional" = 'Unbalance V3 - thp L9 >3Mbps to colo' THEN 1 END) AS p1_unbalance_v3_thp_l9,
                COUNT(CASE WHEN unbalanced_3method = 'unbalanced_p1' AND "Status Final Regional" = 'Unbalance V2 - L18L21 >40%' THEN 1 END) AS p1_unbalance_v2_l18l21_40,

                ROUND(
                    COUNT(CASE WHEN unbalanced_3method = 'balanced' THEN 1 END)::NUMERIC
                    / NULLIF(COUNT(unbalanced_3method), 0) * 100, 4
                )                                                                 AS pct_achv_balanced,
                ROUND(
                    COUNT(CASE WHEN unbalanced_3method = 'unbalanced_p1' THEN 1 END)::NUMERIC
                    / NULLIF(COUNT(unbalanced_3method), 0) * 100, 4
                )                                                                 AS pct_achv_unbalance_p1,
                ROUND(
                    COUNT(CASE WHEN unbalanced_3method = 'unbalanced_p2' THEN 1 END)::NUMERIC
                    / NULLIF(COUNT(unbalanced_3method), 0) * 100, 4
                )                                                                 AS pct_achv_unbalance_p2,
                ROUND(
                    COUNT(CASE WHEN unbalanced_3method = 'unbalanced_p3' THEN 1 END)::NUMERIC
                    / NULLIF(COUNT(unbalanced_3method), 0) * 100, 4
                )                                                                 AS pct_achv_unbalance_p3
            FROM raw_rci_unb
            WHERE week IN (SELECT week FROM week_scope)
            AND region = ${searchByValueLocation.trim()}
            GROUP BY week, region
        ),

        unb_wow AS (
            SELECT
                *,
                -- WoW Balanced
                ROUND(LAG(pct_achv_balanced) OVER (
                    PARTITION BY region ORDER BY week
                )::NUMERIC, 4)                                                    AS prev_pct_achv_balanced,
                ROUND((pct_achv_balanced - LAG(pct_achv_balanced) OVER (
                    PARTITION BY region ORDER BY week
                ))::NUMERIC, 4)                                                   AS wow_pct_achv_balanced,

                -- WoW Unbalanced P1
                ROUND(LAG(pct_achv_unbalance_p1) OVER (
                    PARTITION BY region ORDER BY week
                )::NUMERIC, 4)                                                    AS prev_pct_achv_unbalance_p1,
                ROUND((pct_achv_unbalance_p1 - LAG(pct_achv_unbalance_p1) OVER (
                    PARTITION BY region ORDER BY week
                ))::NUMERIC, 4)                                                   AS wow_pct_achv_unbalance_p1,

                -- WoW Unbalanced P2
                ROUND(LAG(pct_achv_unbalance_p2) OVER (
                    PARTITION BY region ORDER BY week
                )::NUMERIC, 4)                                                    AS prev_pct_achv_unbalance_p2,
                ROUND((pct_achv_unbalance_p2 - LAG(pct_achv_unbalance_p2) OVER (
                    PARTITION BY region ORDER BY week
                ))::NUMERIC, 4)                                                   AS wow_pct_achv_unbalance_p2,

                -- WoW Unbalanced P3
                ROUND(LAG(pct_achv_unbalance_p3) OVER (
                    PARTITION BY region ORDER BY week
                )::NUMERIC, 4)                                                    AS prev_pct_achv_unbalance_p3,
                ROUND((pct_achv_unbalance_p3 - LAG(pct_achv_unbalance_p3) OVER (
                    PARTITION BY region ORDER BY week
                ))::NUMERIC, 4)                                                   AS wow_pct_achv_unbalance_p3
            FROM unb_agg
        )

        SELECT
            r.week                                                                           AS yearweek,
            CASE WHEN (SELECT valid FROM is_valid) THEN (SELECT week FROM prev_week)
                ELSE NULL END                                                               AS prev_yearweek,
            r.region,

            -- RCI
            r.green_count,
            r.investment_count,
            r.operation_count,
            r.optim_count,
            r.vendor_count,
            r.total_simplify_remark,
            r.pct_achv_rci,
            CASE WHEN (SELECT valid FROM is_valid) THEN r.prev_pct_achv_rci  ELSE NULL END  AS prev_pct_achv_rci,
            CASE WHEN (SELECT valid FROM is_valid) THEN r.wow_pct_achv_rci   ELSE NULL END  AS wow_pct_achv_rci,

            -- Unbalanced counts
            u.balanced_count,
            u.unbalanced_p1_count,
            u.unbalanced_p2_count,
            u.unbalanced_p3_count,
            u.total_unbalanced_3method,
                
                -- P1 Breakdown columns
            u.p1_unbalance_v2_l18l21_vs_l23,   -- Unbalance V2 - L18L21 vs L23 >40%
            u.p1_unbalance_v1_l18l21,           -- Unbalance V1 - L18L21 >30%
            u.p1_unbalance_v3_thp_l9,           -- Unbalance V3 - thp L9 >3Mbps to colo
            u.p1_unbalance_v2_l18l21_40,        -- Unbalance V2 - L18L21 >40%

            -- Balanced
            u.pct_achv_balanced,
            CASE WHEN (SELECT valid FROM is_valid) THEN u.prev_pct_achv_balanced       ELSE NULL END AS prev_pct_achv_balanced,
            CASE WHEN (SELECT valid FROM is_valid) THEN u.wow_pct_achv_balanced        ELSE NULL END AS wow_pct_achv_balanced,

            -- Unbalanced P1
            u.pct_achv_unbalance_p1,
            CASE WHEN (SELECT valid FROM is_valid) THEN u.prev_pct_achv_unbalance_p1   ELSE NULL END AS prev_pct_achv_unbalance_p1,
            CASE WHEN (SELECT valid FROM is_valid) THEN u.wow_pct_achv_unbalance_p1    ELSE NULL END AS wow_pct_achv_unbalance_p1,

            -- Unbalanced P2
            u.pct_achv_unbalance_p2,
            CASE WHEN (SELECT valid FROM is_valid) THEN u.prev_pct_achv_unbalance_p2   ELSE NULL END AS prev_pct_achv_unbalance_p2,
            CASE WHEN (SELECT valid FROM is_valid) THEN u.wow_pct_achv_unbalance_p2    ELSE NULL END AS wow_pct_achv_unbalance_p2,

            -- Unbalanced P3
            u.pct_achv_unbalance_p3,
            CASE WHEN (SELECT valid FROM is_valid) THEN u.prev_pct_achv_unbalance_p3   ELSE NULL END AS prev_pct_achv_unbalance_p3,
            CASE WHEN (SELECT valid FROM is_valid) THEN u.wow_pct_achv_unbalance_p3    ELSE NULL END AS wow_pct_achv_unbalance_p3

        FROM rci_wow r
        JOIN unb_wow u ON u.week = r.week
                    AND u.region = r.region
        WHERE r.week = (SELECT selected_week FROM params)
        ORDER BY r.region;
        `);

    // console.log("Result:", result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

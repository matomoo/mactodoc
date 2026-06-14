// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v1 } from "@/app/(project)/tinfra/_drizzle/db_mdoc";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";
import { format } from "date-fns";
import { subDays } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const siteid = searchParams.get("siteid");
  const city = searchParams.get("city");
  const beforeDay1 = searchParams.get("beforeDay1");
  const afterDay3 = searchParams.get("afterDay3");

  if (!siteid || !city || !beforeDay1 || !afterDay3) {
    return NextResponse.json(
      {
        error: "Missing required params: siteid, band, city, beforeDay1, afterDay3",
      },
      { status: 400 },
    );
  }

  try {
    const result = await db_conn_v1.execute<Data2G4GModel>(sql`
            WITH params AS (
                SELECT
                    ${siteid}::TEXT     AS siteid,
                    ${format(subDays(afterDay3, 2), "yyyy-MM-dd")}::DATE AS day1,
                    ${format(subDays(afterDay3, 1), "yyyy-MM-dd")}::DATE AS day2,
                    ${format(subDays(afterDay3, 0), "yyyy-MM-dd")}::DATE AS day3
            ),

            -- PRB busy hour utilization per sector per band from meas_4g_bdbh
            prb_raw AS (
                SELECT
                    d.siteid,
                    d.sector,
                    d.band,
                    ROUND((
                        SUM(b."PRB Number Used on Downlink Channel") /
                        NULLIF(
                            SUM(d."DL RB Available AMQ") * 3600000.0
                        , 0) * 100
                    )::numeric, 0)                                                  AS prb_util
                FROM "public"."meas_4g_bdbh" b
                INNER JOIN "public"."meas_4g_dy" d
                    ON b.siteid_cellid = d.siteid_cellid
                AND DATE(b."Begin Time") = DATE(d."Begin Time")
                CROSS JOIN params
                WHERE d.siteid = params.siteid
                AND DATE(b."Begin Time") BETWEEN params.day1 AND params.day3
                GROUP BY d.siteid, d.sector, d.band
            ),

            -- Pivot bands into columns per sector
            prb_pivot AS (
                SELECT
                    siteid,
                    sector,
                    COUNT(DISTINCT band)                                            AS band_combination,
                    ROUND(MAX(CASE WHEN band = 'L900'  THEN prb_util END), 0)     AS prb_l900,
                    ROUND(MAX(CASE WHEN band = 'L1800' THEN prb_util END), 0)     AS prb_l1800,
                    ROUND(MAX(CASE WHEN band = 'L2100' THEN prb_util END), 0)     AS prb_l2100,
                    ROUND(MAX(CASE WHEN band = 'L2300' THEN prb_util END), 0)     AS prb_l2300
                FROM prb_raw
                GROUP BY siteid, sector
            ),

            -- Compute gap, max, min
            prb_final AS (
                SELECT
                    siteid,
                    sector,
                    band_combination,
                    prb_l900,
                    prb_l1800,
                    prb_l2100,
                    prb_l2300,
                    GREATEST(
                        COALESCE(prb_l900,  0),
                        COALESCE(prb_l1800, 0),
                        COALESCE(prb_l2100, 0),
                        COALESCE(prb_l2300, 0)
                    )                                                               AS max_prb,
                    LEAST(
                        COALESCE(prb_l900,  100),
                        COALESCE(prb_l1800, 100),
                        COALESCE(prb_l2100, 100),
                        COALESCE(prb_l2300, 100)
                    )                                                               AS min_prb,
                    CASE WHEN prb_l900  IS NOT NULL THEN 100 - prb_l900  ELSE NULL END AS gap_l900,
                    CASE WHEN prb_l1800 IS NOT NULL THEN 100 - prb_l1800 ELSE NULL END AS gap_l1800,
                    CASE WHEN prb_l2100 IS NOT NULL THEN 100 - prb_l2100 ELSE NULL END AS gap_l2100,
                    CASE WHEN prb_l2300 IS NOT NULL THEN 100 - prb_l2300 ELSE NULL END AS gap_l2300
                FROM prb_pivot
            )

            SELECT
                siteid                                                              AS "Site ID",
                sector                                                              AS "Sector",
                band_combination                                                    AS "Band Combination",
                -- PRB Actual
                CONCAT(prb_l900,  '%')                                             AS "L900",
                CONCAT(prb_l1800, '%')                                             AS "L1800",
                CONCAT(prb_l2100, '%')                                             AS "L2100",
                CONCAT(prb_l2300, '%')                                             AS "L2300",
                CONCAT(max_prb,   '%')                                             AS "Max PRB",
                CONCAT(min_prb,   '%')                                             AS "Min PRB",
                -- Gap PRB
                CONCAT(gap_l900,  '%')                                             AS "Gap L900",
                CONCAT(gap_l1800, '%')                                             AS "Gap L1800",
                CONCAT(gap_l2100, '%')                                             AS "Gap L2100",
                CONCAT(gap_l2300, '%')                                             AS "Gap L2300",
                CONCAT(
                    GREATEST(
                        COALESCE(gap_l900,  0),
                        COALESCE(gap_l1800, 0),
                        COALESCE(gap_l2100, 0),
                        COALESCE(gap_l2300, 0)
                    ), '%'
                )                                                                   AS "Max GAP PRB"
            FROM prb_final
            ORDER BY siteid, sector;
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

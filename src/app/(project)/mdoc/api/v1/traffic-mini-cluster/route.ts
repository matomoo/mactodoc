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
                    ${siteid}::text AS siteid_main,
                    ${beforeDay1}::timestamp AS start_date,
                    ${afterDay3}::timestamp AS end_date
            ),
            tier_sites AS (
                SELECT d.siteid_tier
                FROM def_tier_site d
                CROSS JOIN params p
                WHERE d.siteid_main = p.siteid_main
            )

            SELECT
                m."Begin Time" AS begin_time,
                '2G' AS group_by,
                SUM(
                    m."TCH Traffic (Erlang) NFJ"
                ) AS productivity_val
            FROM meas_2g_dy m
            JOIN tier_sites t
                ON t.siteid_tier = m.siteid
            CROSS JOIN params p
            WHERE m."Begin Time" >= p.start_date
            AND m."Begin Time" < p.end_date
            GROUP BY m."Begin Time"

            UNION ALL

            SELECT
                m."Begin Time" AS begin_time,
                '4G' AS group_by,
                0 AS productivity_val
            FROM meas_4g_dy m
            JOIN tier_sites t
                ON t.siteid_tier = m.siteid
            CROSS JOIN params p
            WHERE m."Begin Time" >= p.start_date
            AND m."Begin Time" < p.end_date
            GROUP BY m."Begin Time"

            ORDER BY begin_time, group_by;
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

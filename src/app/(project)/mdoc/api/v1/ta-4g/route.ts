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
            WITH ta_summary AS (
              SELECT
                t1.siteid,
                t1.band,
                t1.siteid_short_band_sector,
                t1."cellId",
              CASE
                  
                  WHEN LENGTH ( t1."cellId" :: TEXT ) = 3 THEN
                  LEFT ( t1."cellId" :: TEXT, 2 ) ELSE LEFT ( t1."cellId" :: TEXT, 1 ) 
                END AS sector,
                ta_range,
                sort_order,
                SUM ( report_times ) AS total_reports 
              FROM
                meas_ta_4g t1
                CROSS JOIN LATERAL (
                  VALUES
                    ( 'TA Value 1 (0-78m)', 1, t1."Report Times of TA Value 1 (0-78m)" ),
                    ( 'TA Value 2 (78-234m)', 2, t1."Report Times of TA Value 2 (78-234m)" ),
                    ( 'TA Value 3 (234-390m)', 3, t1."Report Times of TA Value 3 (234-390m)" ),
                    ( 'TA Value 4 (390-546m)', 4, t1."Report Times of TA Value 4 (390-546m)" ),
                    ( 'TA Value 5 (546-702m)', 5, t1."Report Times of TA Value 5 (546-702m)" ),
                    ( 'TA Value 6 (702-858m)', 6, t1."Report Times of TA Value 6 (702-858m)" ),
                    ( 'TA Value 7 (858-1014m)', 7, t1."Report Times of TA Value 7 (858-1014m)" ),
                    ( 'TA Value 8 (1014-1560m)', 8, t1."Report Times of TA Value 8 (1014-1560m)" ),
                    ( 'TA Value 9 (1560-2106m)', 9, t1."Report Times of TA Value 9 (1560-2106m)" ),
                    ( 'TA Value 10 (2106-2652m)', 10, t1."Report Times of TA Value 10 (2106-2652m)" ),
                    ( 'TA Value 11 (2652-3198m)', 11, t1."Report Times of TA Value 11 (2652-3198m)" ),
                    ( 'TA Value 12 (3198-4212m)', 12, t1."Report Times of TA Value 12 (3198-4212m)" ),
                    ( 'TA Value 13 (4212-6708m)', 13, t1."Report Times of TA Value 13 (4212-6708m)" ),
                    ( 'TA Value 14 (6708-10608m)', 14, t1."Report Times of TA Value 14 (6708-10608m)" ),
                    ( 'TA Value 15 (> 10608m)', 15, t1."Report Times of TA Value 15 (> 10608m)" ) 
                ) AS v ( ta_range, sort_order, report_times ) 
              WHERE
                t1.siteid = ${siteid} 
                AND t1."Begin Time" = ${afterDay3} 
              GROUP BY
                t1.siteid,
                t1.band,
                t1.siteid_short_band_sector,
                t1."cellId",
                ta_range,
                sort_order 
            ) SELECT
            *,
            ROUND(
                (
                    SUM(total_reports) OVER (
                        PARTITION BY "cellId"
                        ORDER BY sort_order
                        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                    ) * 100::numeric
                    /
                    NULLIF(
                        SUM(total_reports) OVER (PARTITION BY "cellId"),
                        0
                    )
                )::numeric,
                2
            ) AS percentage
            FROM
              ta_summary 
            ORDER BY
              "cellId",
              sort_order;
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

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
  const day1 = searchParams.get("day1");
  const day2 = searchParams.get("day2");
  const day3 = searchParams.get("day3");

  if (!siteid || !band || !city || !day1 || !day2 || !day3) {
    return NextResponse.json(
      {
        error: "Missing required params: siteid, band, city, day1, day2, day3",
      },
      { status: 400 },
    );
  }

  try {
    const result = await db_conn_v1.execute<Data2G4GModel>(sql`
            SELECT
                date_val                                                        AS "Date",
                MAX(CASE WHEN kpi_index = 1  THEN kpi_val END)                 AS "TCH Availability (%)",
                MAX(CASE WHEN kpi_index = 2  THEN kpi_val END)                 AS "SDCCH Success Rate (%)",
                MAX(CASE WHEN kpi_index = 3  THEN kpi_val END)                 AS "Handover Success Rate (%)",
                MAX(CASE WHEN kpi_index = 4  THEN kpi_val END)                 AS "TCH Drop Rate (%)",
                MAX(CASE WHEN kpi_index = 5  THEN kpi_val END)                 AS "TCH Blocking Rate (%)",
                MAX(CASE WHEN kpi_index = 6  THEN kpi_val END)                 AS "SDCCH Blocking Rate (%)",
                MAX(CASE WHEN kpi_index = 7  THEN kpi_val END)                 AS "TBF DL Est SR (%)",
                MAX(CASE WHEN kpi_index = 8  THEN kpi_val END)                 AS "TBF UL Est SR (%)",
                MAX(CASE WHEN kpi_index = 9  THEN kpi_val END)                 AS "TBF Completion SR (%)",
                MAX(CASE WHEN kpi_index = 10 THEN kpi_val END)                 AS "UL RxQual 0-4 (%)",
                MAX(CASE WHEN kpi_index = 11 THEN kpi_val END)                 AS "DL RxQual 0-4 (%)",
                MAX(CASE WHEN kpi_index = 12 THEN kpi_val END)                 AS "ICM Band 3-5 (%)",
                MAX(CASE WHEN kpi_index = 13 THEN kpi_val END)                 AS "Radio Utilization (%)",
                MAX(CASE WHEN kpi_index = 14 THEN kpi_val END)                 AS "TCH Traffic (Erlang)",
                MAX(CASE WHEN kpi_index = 15 THEN kpi_val END)                 AS "EDGE DL Throughput (Kbps)",
                MAX(CASE WHEN kpi_index = 16 THEN kpi_val END)                 AS "GPRS DL Throughput (Kbps)",
                MAX(CASE WHEN kpi_index = 17 THEN kpi_val END)                 AS "EDGE DL Payload (GByte)",
                MAX(CASE WHEN kpi_index = 18 THEN kpi_val END)                 AS "EDGE UL Payload (GByte)"
            FROM get_kpi_statistic_2g_v2(
                ${siteid},
                ${band},
                ${city},
                ${day1},
                ${day2},
                ${day3}
            )
            GROUP BY row_type, date_val
            ORDER BY
                CASE date_val
                    WHEN ${day1} THEN 1
                    WHEN ${day2} THEN 2
                    WHEN ${day3} THEN 3
                    WHEN 'Average'    THEN 4
                    WHEN 'Target'     THEN 5
                    WHEN 'Delta'      THEN 6
                    WHEN 'Remark'     THEN 7
                END;
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

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
            SELECT
                d."Begin Time" AS begin_time,
                d.sector,
                SUBSTRING ( "E-UTRAN FDD Cell Name", 3, 9 ) AS group_by,
                ROUND(
                    (
                        SUM ( b."PRB Number Used on Downlink Channel" ) / NULLIF ( SUM ( d."DL RB Available AMQ" ) * 3600000.0, 0 ) * 100 
                    ) :: NUMERIC,
                    2 
                ) AS productivity_val 
            FROM
                "public"."meas_4g_bdbh" b
                INNER JOIN "public"."meas_4g_dy" d ON b.siteid_cellid = d.siteid_cellid 
                AND DATE ( b."Begin Time" ) = DATE ( d."Begin Time" ) 
            WHERE
                d.siteid = ${siteid} 
                AND DATE ( b."Begin Time" ) BETWEEN ${beforeDay1}
                AND ${afterDay3} 
            GROUP BY
                d."Begin Time",
                d.sector,
                d."E-UTRAN FDD Cell Name"
            
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

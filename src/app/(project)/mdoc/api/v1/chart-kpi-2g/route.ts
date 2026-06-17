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
            SELECT
                "Begin Time" as begin_time,
                "BTS Name" as group_by,
                SUM ( "Num TCH Availability_Ono" ) / NULLIF ( SUM ( "Denum TCH Availability_ono" ), 0 ) * 100 AS availability,
                SUM ( "SDSR_num_ono" ) / NULLIF ( SUM ( "SDSR_denum_ono" ), 0 ) * 100 AS sdsr,
                SUM ( "HOSR_num_ono" ) / NULLIF ( SUM ( "HOSR_denum_ono" ), 0 ) * 100 AS hosr,
                SUM ( "Num TCH Drop NFJ" ) / NULLIF ( SUM ( "Denum TCH Drop NFJ" ), 0 ) AS dcr,
                SUM ( "Num TBF DL Est SR NFJ" ) / NULLIF ( SUM ( "Denum TBF DL Est SR NFJ" ), 0 ) * 100 AS tbf_dl,
                SUM ( "Num TBF Comp SR NFJ" ) / NULLIF ( SUM ( "Denum TBF Comp SR NFJ" ), 0 ) * 100 AS tbf_comp,
                SUM ( "Number of fastreturn to LTE" ) AS fast_return_lte
            FROM
                meas_2g_dy 
            WHERE
                siteid = ${siteid} 
                AND "Begin Time" BETWEEN ${beforeDay1} AND ${afterDay3}
            GROUP BY
                "Begin Time",
                "BTS Name"
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

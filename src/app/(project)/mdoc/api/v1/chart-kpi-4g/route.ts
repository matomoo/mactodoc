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
                CONCAT('Sector-',right(sector,1), ' - ', short_band,'1') as group_by,
                SUM ( "Cell Availability Num 4G AMQ" ) / NULLIF ( SUM ( "Cell Availability Denum 4G AMQ" ), 0 ) * 100 AS availability,
                SUM ( "Num RRC Setup SR AMQ" ) / NULLIF ( SUM ( "Denum RRC Setup SR AMQ" ), 0 ) * 100 AS rrc_setup,
                SUM ( "Num E-RAB Setup SR AMQ" ) / NULLIF ( SUM ( "Denum E-RAB Setup SR AMQ" ), 0 ) * 100 AS erab_setup,
                SUM ( "Num CSSR AMQ" ) / NULLIF ( SUM ( "Denum CSSR AMQ" ), 0 ) * 100 AS cssr,
                SUM ( "Num E-RAB Drop AMQ" ) / NULLIF ( SUM ( "Denum E-RAB Drop AMQ" ), 0 ) AS erab_drop,
                SUM ( "Num IFHO SR AMQ" ) / NULLIF ( SUM ( "Denum IFHO SR AMQ" ), 0 ) * 100 AS ifho,
                SUM ( "Num CSFB SR AMQ" ) / NULLIF ( SUM ( "Denum CSFB SR AMQ" ), 0 ) * 100 AS csfb,
                AVG ( "CQI Average AMQ" ) AS cqi_average,
                AVG ( "FDD Spectral Efficiency 2" ) AS se2,
                SUM ( "Number of Redirection Requests from LTE to GSM(CSFB)" ) AS number_csfb,
                SUM ( "Total Payload CA_(MByte) AMQ" ) AS payload_ca 
            FROM
                meas_4g_dy 
            WHERE
                siteid = ${siteid} 
                AND "Begin Time" BETWEEN ${beforeDay1} AND ${afterDay3}
            GROUP BY
                "Begin Time",
                siteid_cellid,
                sector,
                short_band
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

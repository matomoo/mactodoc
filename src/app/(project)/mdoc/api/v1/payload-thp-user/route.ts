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
                "Begin Time" AS begin_time,
                sector,
                SUM ( "4G Payload (MByte) AMQ" ) AS payload_gb,
                SUM ( "Maximum Cell DL PDCP Throughput(Mbps)" ) AS max_cell_pdcp_thp_mbps,
                SUM ( "Maximum RRC-Connected User Number" ) AS max_rrc_con_user_number 
            FROM
                meas_4g_dy 
            WHERE
                siteid = ${siteid} AND
                "Begin Time" between ${beforeDay1} and ${afterDay3}
            GROUP BY
                "Begin Time",
                sector 
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

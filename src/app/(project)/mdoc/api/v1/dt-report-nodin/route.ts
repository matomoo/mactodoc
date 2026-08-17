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
  // const beforeDay1 = searchParams.get("beforeDay1");
  const afterDay3 = searchParams.get("afterDay3");

  if (!siteid || !city || !afterDay3) {
    return NextResponse.json(
      {
        error: "Missing required params: siteid, band, city, afterDay3",
      },
      { status: 400 },
    );
  }

  try {
    const result = await db_conn_v1.execute<Data2G4GModel>(sql`
            SELECT
                d.siteid AS siteid,
                d."eNodeB Name" AS enodeb_name,
                d."E-UTRAN FDD Cell Name" AS cell_name,
                d.band AS band,
                d.sector as sector,
                d."cellId" as cellid
            FROM
                meas_4g_dy d 
            WHERE
                d.siteid = ${siteid} 
                AND d."Begin Time" = ${afterDay3} 
                AND d.band = ${band}
        `);

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

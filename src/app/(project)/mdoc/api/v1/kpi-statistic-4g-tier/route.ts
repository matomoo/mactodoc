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
  const beforeDay2 = searchParams.get("beforeDay2");
  const beforeDay3 = searchParams.get("beforeDay3");
  const afterDay1 = searchParams.get("afterDay1");
  const afterDay2 = searchParams.get("afterDay2");
  const afterDay3 = searchParams.get("afterDay3");

  if (
    !siteid ||
    !band ||
    !city ||
    !beforeDay1 ||
    !beforeDay2 ||
    !beforeDay3 ||
    !afterDay1 ||
    !afterDay2 ||
    !afterDay3
  ) {
    return NextResponse.json(
      {
        error:
          "Missing required params: siteid, band, city, beforeDay1, beforeDay2, beforeDay3, afterDay1, afterDay2, afterDay3",
      },
      { status: 400 },
    );
  }

  try {
    const result = await db_conn_v1.execute<Data2G4GModel>(sql`
            SELECT * FROM get_kpi_statistic_4g_tier(${siteid}, ${city}, ${beforeDay1}, ${beforeDay2}, ${beforeDay3}, ${afterDay1}, ${afterDay2}, ${afterDay3})
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

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
            SELECT * FROM get_kpi_statistic_4g(${siteid}, ${band}, ${city}, ${day1}, ${day2}, ${day3})
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

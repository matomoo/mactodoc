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
            -- Single row
            SELECT * FROM (
                SELECT
                    t.band_city                                         AS "BandCity",
                    t.city                                              AS "City",
                    t.band                                              AS "Band",
                    MAX(CASE WHEN t.kpi_index = 2  THEN t.target END)  AS "RRC Est Success Rate (%)",
                    MAX(CASE WHEN t.kpi_index = 3  THEN t.target END)  AS "E-RAB Success Rate (%)",
                    MAX(CASE WHEN t.kpi_index = 4  THEN t.target END)  AS "Call Setup Success Rate (%)",
                    MAX(CASE WHEN t.kpi_index = 5  THEN t.target END)  AS "E-RAB Drop Rate (%)",
                    MAX(CASE WHEN t.kpi_index = 6  THEN t.target END)  AS "Intra Freq LTE HO (%)",
                    -- MAX(CASE WHEN t.kpi_index = 6  THEN t.target END)  AS "Inter Freq LTE HO (%)",
                    MAX(CASE WHEN t.kpi_index = 7  THEN t.target END)  AS "CSFB (%)",
                    MAX(CASE WHEN t.kpi_index = 8  THEN t.target END)  AS "CQI Average",
                    MAX(CASE WHEN t.kpi_index = 9  THEN t.target END)  AS "SE2",
                    MAX(CASE WHEN t.kpi_index = 10 THEN t.target END)  AS "Uplink RSSI (dBm)"
                FROM "public"."target_kpi_4g" t
                GROUP BY t.band_city, t.city, t.band
            ) pivot
            WHERE "City" = ${city} AND "Band" = ${band};
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

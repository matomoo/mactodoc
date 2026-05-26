// biome-ignore assist/source/organizeImports: <will fix later>
import { db_conn_v1 } from "@/app/(project)/tinfra/_drizzle/db_mdoc";
import type { Data2G4GModel } from "@/types/schema";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fieldToAggregate = searchParams.get("fieldToAggregate") || "---";
  const searchByParams = searchParams.get(fieldToAggregate) || "---";
  const searchBySiteId = searchParams.get("siteId") || "---";

  const tgl_1 = searchParams.get("tgl_1");
  const tgl_2 = searchParams.get("tgl_2");

  if (!tgl_1 || !tgl_2) {
    return NextResponse.json({ error: "Both tgl_1 and tgl_2 parameters are required" }, { status: 400 });
  }

  let formattedTgl1: string;
  let formattedTgl2: string;

  try {
    formattedTgl1 = new Date(tgl_1).toISOString();
    formattedTgl2 = new Date(tgl_2).toISOString();
    const searchValues = searchBySiteId.split(",").filter((c) => c.trim() !== "");

    let searchByCondition: unknown;
    if (fieldToAggregate === "siteid_cellid") {
      if (searchValues.length === 0) {
        searchByCondition = sql``;
      } else if (searchValues.length === 1) {
        searchByCondition = sql`AND tref.siteid = ${searchValues[0].trim()}`;
      } else {
        const multiSearchList = searchValues.map((c) => `'${c.trim()}'`).join(",");
        searchByCondition = sql`AND tref.siteid IN (${sql.raw(multiSearchList)})`;
      }
    }

    console.log({ searchValues });
    console.log(`AND tref.${fieldToAggregate} = ${searchValues[0].trim()}`);

    const result = await db_conn_v1.execute<Data2G4GModel>(sql`
          SELECT
            *
          FROM
            sqac_tracker
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

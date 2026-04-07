// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v2 } from "../../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fieldToAggregate = searchParams.get("fieldToAggregate") || "---";
  const searchByParams = searchParams.get(fieldToAggregate) || "---";

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
    const searchValues = searchByParams.split(",").filter((c) => c.trim() !== "");

    // biome-ignore lint/suspicious/noExplicitAny: <none>
    let searchByCondition: any;
    if (searchByParams === "---" || searchByParams === "All" || searchValues.length === 0) {
      searchByCondition = sql``;
    } else if (searchValues.length === 1) {
      searchByCondition = sql`AND tref.${sql.raw(fieldToAggregate)} = ${searchValues[0].trim()}`;
    } else {
      const multiSearchList = searchValues.map((c) => `'${c.trim()}'`).join(",");
      searchByCondition = sql`AND tref.${sql.raw(fieldToAggregate)} IN (${sql.raw(multiSearchList)})`;
    }

    const result = await db_conn_v2.execute<Data2G4GModel>(sql`
          WITH tref_agg AS (
              SELECT region
              FROM ref_cell_4g
              GROUP BY region
          )
          SELECT 
              t1.year_week,
              COUNT(CASE WHEN t1.status = 'Lose' THEN 1 END) AS "Lose",
              COUNT(CASE WHEN t1.status = 'Win' THEN 1 END) AS "Win",
              '11' AS target_kpi
          FROM
              raw_tutela t1
          INNER JOIN tref_agg tref
              ON tref.region = t1.location
          WHERE
              t1.provider = 'Telkomsel'
              AND t1.level = 'Region'
              ${searchByCondition}
          GROUP BY
              t1.year_week
          ORDER BY
              t1.year_week;
        `);

    // console.log("Search params:", { fieldToAggregate, searchByParams, tgl_1, tgl_2 });
    // console.log("Search condition:", _searchByCondition);
    // console.log("Result:", result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

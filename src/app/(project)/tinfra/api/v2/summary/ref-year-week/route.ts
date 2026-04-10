// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v2 } from "../../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fieldToAggregate = searchParams.get("fieldToAggregate") || "---";
  const searchByParams = searchParams.get(fieldToAggregate) || "---";

  const aggregateColumn =
    fieldToAggregate === "region"
      ? "regional"
      : fieldToAggregate === "kabupaten"
        ? "t1.kabupaten"
        : fieldToAggregate === "site_id"
          ? "site_id"
          : "no_data";

  //   const tgl_1 = searchParams.get("tgl_1");
  //   const tgl_2 = searchParams.get("tgl_2");

  //   if (!tgl_1 || !tgl_2) {
  //     return NextResponse.json({ error: "Both tgl_1 and tgl_2 parameters are required" }, { status: 400 });
  //   }

  // let formattedTgl1: string;
  // let formattedTgl2: string;

  try {
    // formattedTgl1 = new Date(tgl_1).toISOString();
    // formattedTgl2 = new Date(tgl_2).toISOString();
    const searchValues = searchByParams.split(",").filter((c) => c.trim() !== "");

    // biome-ignore lint/suspicious/noExplicitAny: <none>
    let searchByCondition: any;
    if (searchByParams === "---" || searchByParams === "All" || searchValues.length === 0) {
      searchByCondition = sql``;
    } else if (searchValues.length === 1) {
      searchByCondition = sql`${sql.raw(aggregateColumn)} = ${searchValues[0].trim()}`;
    } else {
      const multiSearchList = searchValues.map((c) => `'${c.trim()}'`).join(",");
      searchByCondition = sql`${sql.raw(aggregateColumn)} IN (${sql.raw(multiSearchList)})`;
    }

    // console.log("hq-rhi > debugging values:", {
    //   fieldToAggregate,
    //   searchByParams,
    //   aggregateColumn,
    //   searchValues,
    //   searchByCondition: searchByCondition.toString()
    // });

    // Build the raw SQL string for logging
    const _rawSQL = `
          select DISTINCT year_week from raw_tutela ORDER BY year_week
        `;

    // console.log("Raw SQL Query:", rawSQL);
    // console.log("Search Condition:", searchByCondition.toString());

    const result = await db_conn_v2.execute<Data2G4GModel>(sql`
          select DISTINCT year_week from raw_tutela ORDER BY year_week
        `);

    // console.log("Result:", result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

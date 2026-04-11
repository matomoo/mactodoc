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

  try {
    const searchValues = searchByParams.split(",").filter((c) => c.trim() !== "");

    // biome-ignore lint/suspicious/noExplicitAny: <none>
    let _searchByCondition: any;
    if (searchByParams === "---" || searchByParams === "All" || searchValues.length === 0) {
      _searchByCondition = sql``;
    } else if (searchValues.length === 1) {
      _searchByCondition = sql`${sql.raw(aggregateColumn)} = ${searchValues[0].trim()}`;
    } else {
      const multiSearchList = searchValues.map((c) => `'${c.trim()}'`).join(",");
      _searchByCondition = sql`${sql.raw(aggregateColumn)} IN (${sql.raw(multiSearchList)})`;
    }

    const result = await db_conn_v2.execute<Data2G4GModel>(sql`
          select DISTINCT year_week from raw_tutela ORDER BY year_week
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

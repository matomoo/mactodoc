// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v2 } from "../../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fieldToAggregate = searchParams.get("fieldToAggregate") || "---";
  //   const searchByParams = searchParams.get(fieldToAggregate) || "---";
  //   const searchByLevel = searchParams.get("level") || "---";
  const searchByYearWeek = searchParams.get("yearweek") || "---";
  const searchByValueLocation = searchParams.get("valueLocation") || "---";
  const searchByTgl2 = searchParams.get("tgl_2") || "---";

  // const searchByParams2 = searchParams.get("level") || "---";
  // const searchByParams3 = searchParams.get("provider") || "---";

  const aggregateColumn =
    fieldToAggregate === "region"
      ? "regional"
      : fieldToAggregate === "kabupaten"
        ? "t1.kabupaten"
        : fieldToAggregate === "site_id"
          ? "site_id"
          : "no_data";

  const tgl_1 = searchParams.get("yearweek");
  const tgl_2 = searchParams.get("yearweek");

  if (!tgl_1 || !tgl_2) {
    return NextResponse.json({ error: "Both tgl_1 and tgl_2 parameters are required" }, { status: 400 });
  }

  try {
    const searchValues = searchByValueLocation.split(",").filter((c) => c.trim() !== "");

    // biome-ignore lint/suspicious/noExplicitAny: <none>
    let searchByCondition: any;
    let searchByCondition2: any;
    if (searchByValueLocation === "---" || searchByValueLocation === "All" || searchValues.length === 0) {
      searchByCondition = sql``;
    } else if (searchValues.length === 1) {
      searchByCondition = sql`${sql.raw(aggregateColumn)} = ${searchValues[0].trim()}`;
    } else {
      const multiSearchList = searchValues.map((c) => `'${c.trim()}'`).join(",");
      searchByCondition = sql`${sql.raw(aggregateColumn)} IN (${sql.raw(multiSearchList)})`;
    }

    if (searchByYearWeek === "All") {
      searchByCondition2 = sql``;
    } else {
      searchByCondition2 = sql`AND weeknum = ${searchByYearWeek}`;
    }

    // console.log("hq-rhi > debugging values:", {
    //   fieldToAggregate,
    //   searchByYearWeek,
    //   searchByParams,
    //   searchByValueLocation,
    //   aggregateColumn,
    //   searchValues,
    //   searchByCondition: searchByCondition.toString(),
    // });

    const result = await db_conn_v2.execute<Data2G4GModel>(sql`
        WITH daily_data AS (
            SELECT 
                TO_CHAR("Date", 'MM-DD') as month_day,
                EXTRACT(YEAR FROM "Date") as year,
                SUM("Total Payload_(TB)") as total_payload,
                MIN("Date") as date_order
            FROM raw_productivity
            WHERE "Date" >= '2024-01-01'
                AND "Date" <= ${searchByTgl2}
            GROUP BY TO_CHAR("Date", 'MM-DD'), EXTRACT(YEAR FROM "Date")
            ),
            ytd_data AS (
            SELECT 
                month_day,
                year,
                total_payload,
                SUM(total_payload) OVER (PARTITION BY year ORDER BY date_order) as ytd_payload
            FROM daily_data
            )
            SELECT 
            d.month_day,
            d.year,
            d.total_payload,
            ROUND(
                CASE 
                WHEN p.ytd_payload IS NOT NULL AND p.ytd_payload > 0 
                THEN ((d.ytd_payload - p.ytd_payload) / p.ytd_payload) * 100
                ELSE NULL
                END::numeric, 2
            ) as ytd_percentage_vs_prev_year
            FROM ytd_data d
            LEFT JOIN ytd_data p ON d.month_day = p.month_day 
            AND p.year = d.year - 1  -- Compare with previous year dynamically
            ORDER BY d.year, d.month_day;
        `);

    // console.log("Result:", result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

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
  const searchByNop = searchParams.get("nop") || "---";

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
        WITH params AS (
        SELECT '${sql.raw(searchByTgl2)}' :: DATE AS selected_date,'${sql.raw(searchByNop)}' AS selected_branch),daily AS (
        SELECT "Date" :: DATE AS DATE,"Branch" AS branch,"Kota/Kabupaten" AS kotakab,SUM ("Total Traffic_(Mio Erlang)") AS traffic,SUM ("Total Payload_(TB)") AS payload FROM raw_productivity WHERE "Date" :: DATE<=(
        SELECT selected_date FROM params) AND "Branch"=(
        SELECT selected_branch FROM params) GROUP BY "Date" :: DATE,"Branch","Kota/Kabupaten"),yoy AS (
        SELECT branch,kotakab,SUM (CASE WHEN DATE>=DATE_TRUNC('year',(
        SELECT selected_date FROM params)) AND DATE<=(
        SELECT selected_date FROM params) THEN traffic END) AS ytd_traffic_this_year,SUM (CASE WHEN DATE>=DATE_TRUNC('year',(
        SELECT selected_date FROM params)) AND DATE<=(
        SELECT selected_date FROM params) THEN payload END) AS ytd_payload_this_year,SUM (CASE WHEN DATE>=DATE_TRUNC('year',(
        SELECT selected_date FROM params))-INTERVAL '1 year' AND DATE<=(
        SELECT selected_date FROM params)-INTERVAL '1 year' THEN traffic END) AS ytd_traffic_last_year,SUM (CASE WHEN DATE>=DATE_TRUNC('year',(
        SELECT selected_date FROM params))-INTERVAL '1 year' AND DATE<=(
        SELECT selected_date FROM params)-INTERVAL '1 year' THEN payload END) AS ytd_payload_last_year FROM daily GROUP BY branch,kotakab),mtd AS (
        SELECT branch,kotakab,SUM (CASE WHEN DATE>=DATE_TRUNC('month',(
        SELECT selected_date FROM params)) AND DATE<=(
        SELECT selected_date FROM params) THEN traffic END) AS mtd_traffic_this_year,SUM (CASE WHEN DATE>=DATE_TRUNC('month',(
        SELECT selected_date FROM params)) AND DATE<=(
        SELECT selected_date FROM params) THEN payload END) AS mtd_payload_this_year,SUM (CASE WHEN DATE>=DATE_TRUNC('month',(
        SELECT selected_date FROM params))-INTERVAL '1 year' AND DATE<=(
        SELECT selected_date FROM params)-INTERVAL '1 year' THEN traffic END) AS mtd_traffic_last_year,SUM (CASE WHEN DATE>=DATE_TRUNC('month',(
        SELECT selected_date FROM params))-INTERVAL '1 year' AND DATE<=(
        SELECT selected_date FROM params)-INTERVAL '1 year' THEN payload END) AS mtd_payload_last_year,SUM (CASE WHEN DATE>=DATE_TRUNC('month',(
        SELECT selected_date FROM params))-INTERVAL '1 month' AND DATE<=(
        SELECT selected_date FROM params)-INTERVAL '1 month' THEN traffic END) AS mtd_traffic_prev_month,SUM (CASE WHEN DATE>=DATE_TRUNC('month',(
        SELECT selected_date FROM params))-INTERVAL '1 month' AND DATE<=(
        SELECT selected_date FROM params)-INTERVAL '1 month' THEN payload END) AS mtd_payload_prev_month FROM daily GROUP BY branch,kotakab),wow AS (
        SELECT branch,kotakab,SUM (CASE WHEN DATE> (
        SELECT selected_date FROM params)-INTERVAL '7 days' AND DATE<=(
        SELECT selected_date FROM params) THEN traffic END) AS wow_traffic_current,SUM (CASE WHEN DATE> (
        SELECT selected_date FROM params)-INTERVAL '7 days' AND DATE<=(
        SELECT selected_date FROM params) THEN payload END) AS wow_payload_current,SUM (CASE WHEN DATE> (
        SELECT selected_date FROM params)-INTERVAL '14 days' AND DATE<=(
        SELECT selected_date FROM params)-INTERVAL '7 days' THEN traffic END) AS wow_traffic_prior,SUM (CASE WHEN DATE> (
        SELECT selected_date FROM params)-INTERVAL '14 days' AND DATE<=(
        SELECT selected_date FROM params)-INTERVAL '7 days' THEN payload END) AS wow_payload_prior FROM daily GROUP BY branch,kotakab) 
        SELECT (
        SELECT selected_date FROM params ) AS selected_date,
        y.branch,
        y.kotakab,
        y.ytd_traffic_this_year,
        y.ytd_traffic_last_year,
        ROUND(
            ( y.ytd_traffic_this_year - y.ytd_traffic_last_year ) :: NUMERIC,
            4 
        ) AS yoy_traffic_diff,
        ROUND(
            (
                y.ytd_traffic_this_year / NULLIF ( y.ytd_traffic_last_year, 0 ) * 100-100 
            ) :: NUMERIC,
            2 
        ) AS yoy_traffic_growth_pct,
        y.ytd_payload_this_year,
        y.ytd_payload_last_year,
        ROUND(
            ( y.ytd_payload_this_year - y.ytd_payload_last_year ) :: NUMERIC,
            4 
        ) AS yoy_payload_diff,
        ROUND(
            (
                y.ytd_payload_this_year / NULLIF ( y.ytd_payload_last_year, 0 ) * 100-100 
            ) :: NUMERIC,
            2 
        ) AS yoy_payload_growth_pct,
        M.mtd_traffic_this_year,
        M.mtd_traffic_last_year,
        ROUND(
            ( M.mtd_traffic_this_year - M.mtd_traffic_last_year ) :: NUMERIC,
            4 
        ) AS mtd_traffic_diff,
        ROUND(
            (
                M.mtd_traffic_this_year / NULLIF ( M.mtd_traffic_last_year, 0 ) * 100-100 
            ) :: NUMERIC,
            2 
        ) AS mtd_traffic_growth_pct,
        M.mtd_payload_this_year,
        M.mtd_payload_last_year,
        ROUND(
            ( M.mtd_payload_this_year - M.mtd_payload_last_year ) :: NUMERIC,
            4 
        ) AS mtd_payload_diff,
        ROUND(
            (
                M.mtd_payload_this_year / NULLIF ( M.mtd_payload_last_year, 0 ) * 100-100 
            ) :: NUMERIC,
            2 
        ) AS mtd_payload_growth_pct,
        M.mtd_traffic_prev_month,
        ROUND(
            ( M.mtd_traffic_this_year - M.mtd_traffic_prev_month ) :: NUMERIC,
            4 
        ) AS mtd_traffic_prev_month_diff,
        ROUND(
            (
                M.mtd_traffic_this_year / NULLIF ( M.mtd_traffic_prev_month, 0 ) * 100-100 
            ) :: NUMERIC,
            2 
        ) AS mtd_this_year_traffic_growth_pct,
        M.mtd_payload_prev_month,
        ROUND(
            ( M.mtd_payload_this_year - M.mtd_payload_prev_month ) :: NUMERIC,
            4 
        ) AS mtd_payload_prev_month_diff,
        ROUND(
            (
                M.mtd_payload_this_year / NULLIF ( M.mtd_payload_prev_month, 0 ) * 100-100 
            ) :: NUMERIC,
            2 
        ) AS mtd_this_year_payload_growth_pct,
        w.wow_traffic_current,
        w.wow_traffic_prior,
        ROUND(
            ( w.wow_traffic_current - w.wow_traffic_prior ) :: NUMERIC,
            4 
        ) AS wow_traffic_diff,
        ROUND(
            (
                w.wow_traffic_current / NULLIF ( w.wow_traffic_prior, 0 ) * 100-100 
            ) :: NUMERIC,
            2 
        ) AS wow_traffic_growth_pct,
        w.wow_payload_current,
        w.wow_payload_prior,
        ROUND(
            ( w.wow_payload_current - w.wow_payload_prior ) :: NUMERIC,
            4 
        ) AS wow_payload_diff,
        ROUND(
            (
                w.wow_payload_current / NULLIF ( w.wow_payload_prior, 0 ) * 100-100 
            ) :: NUMERIC,
            2 
        ) AS wow_payload_growth_pct 
        FROM
            yoy y
            JOIN mtd M ON M.branch = y.branch 
            AND M.kotakab = y.kotakab
            JOIN wow w ON w.branch = y.branch 
            AND w.kotakab = y.kotakab 
        ORDER BY
            y.branch,
            y.kotakab;
        `);

    // console.log("Result:", result);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

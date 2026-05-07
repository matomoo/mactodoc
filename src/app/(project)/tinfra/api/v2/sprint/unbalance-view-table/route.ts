// app/tinfra/api/meas-db-ti-sul/aggregate/meas-dy-dynamic-4g-v3/route.ts

// biome-ignore assist/source/organizeImports: <none>
import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { sql } from "drizzle-orm";
import { db_conn_v2 } from "../../../../_drizzle/db_ti_sul";

export const runtime = "nodejs";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function getTTL(tgl2: string): number {
  const endDate = new Date(tgl2);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (endDate < today) {
    return 23 * 3600; // 23 hours — historical data, safe ✅
  }
  return 15 * 60; // 15 minutes — today's data still updating ⚠️
}

function buildCacheKey(params: URLSearchParams): string {
  const tgl1 = params.get("tgl_1") ?? "";
  const tgl2 = params.get("tgl_2") ?? "";
  const region = params.get("region") ?? "";
  const field = params.get("fieldToAggregate") ?? "";

  // Only include params that actually affect the SQL query
  return `sprint-unbalance:${tgl1}:${tgl2}`;
}

async function runQuery(params: URLSearchParams) {
  const tgl1 = params.get("tgl_1");
  const tgl2 = params.get("tgl_2");
  const sector = params.get("sector") ?? "---";

  // ✅ Guard against missing dates
  if (!tgl1 || !tgl2) {
    throw new Error("Missing required date parameters tgl_1 or tgl_2");
  }

  const searchValues = sector.split(",").filter((c) => c.trim() !== "");

  // biome-ignore lint/suspicious/noExplicitAny: <none>
  let searchByCondition: any;
  if (sector === "---" || sector === "All" || searchValues.length === 0) {
    searchByCondition = sql``;
  } else if (searchValues.length === 1) {
    searchByCondition = sql`AND tref.sector = ${searchValues[0].trim()}`;
  } else {
    const multiSearchList = searchValues.map((c) => `'${c.trim()}'`).join(",");
    searchByCondition = sql`AND tref.sector IN (${sql.raw(multiSearchList)})`;
  }

  return await db_conn_v2.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL work_mem = '64MB'`);
    await tx.execute(sql`SET LOCAL max_parallel_workers_per_gather = 4`);

    const result = await tx.execute(sql`
      WITH t1_filtered AS (
            SELECT
              "Begin Time", "SubnetWork ID", "ManagedElement ID",
              "eNodeBId", "cellId", "Cell Name",
              "4G Payload (MByte) AMQ"
            FROM "measDy4g"
            WHERE "Begin Time" >= ${tgl1} ::TIMESTAMP
                  AND "Begin Time" <= ${tgl2}::TIMESTAMP
          ),
          t2_filtered AS (
            SELECT
              "Begin Time", "SubnetWork ID", "ManagedElement ID",
              "eNodeBId", "cellId",
              "DL PRB Utilization Num AMQ", "DL PRB Utilization Denum AMQ",
              "UL PRB Utilization Num AMQ", "UL PRB Utilization Denum AMQ",
              "User DL Throughput Num AMQ", "User DL Throughput Denum AMQ",
              "User UL Throughput Num AMQ", "User UL Throughput Denum AMQ"
            FROM "measBdbh4g"
            WHERE "Begin Time" >= ${tgl1} ::TIMESTAMP
                  AND "Begin Time" <= ${tgl2}::TIMESTAMP
          )
          SELECT
            t1."Begin Time"                                       AS "BEGIN_TIME",
            tref.sector                                           AS "G4_SECTOR",
            tref.band                                           AS "G4_BAND",
            SUM(t1."4G Payload (MByte) AMQ") / 1024              AS "TOTAL_PAYLOAD_GB",
            SUM(t2."DL PRB Utilization Num AMQ")                 AS "G4_DL_PRB_UTILIZATION_NUM",
            SUM(t2."DL PRB Utilization Denum AMQ")               AS "G4_DL_PRB_UTILIZATION_DENUM",
            SUM(t2."UL PRB Utilization Num AMQ")                 AS "G4_UL_PRB_UTILIZATION_NUM",
            SUM(t2."UL PRB Utilization Denum AMQ")               AS "G4_UL_PRB_UTILIZATION_DENUM",
            SUM(t2."User DL Throughput Num AMQ")                 AS "G4_USER_DL_THP_NUM",
            SUM(t2."User DL Throughput Denum AMQ")               AS "G4_USER_DL_THP_DENUM",
            SUM(t2."User UL Throughput Num AMQ")                 AS "G4_USER_UL_THP_NUM",
            SUM(t2."User UL Throughput Denum AMQ")               AS "G4_USER_UL_THP_DENUM",
            '1'                                                   AS "DENUMBY1"
          FROM t1_filtered t1
          LEFT JOIN t2_filtered t2
            ON  t2."Begin Time"        = t1."Begin Time"
            AND t2."ManagedElement ID" = t1."ManagedElement ID"
            AND t2."SubnetWork ID"     = t1."SubnetWork ID"
            AND t2."eNodeBId"          = t1."eNodeBId"
            AND t2."cellId"            = t1."cellId"
          INNER JOIN ref_cell_4g tref
            ON tref.siteid_cellid = CONCAT(
                CASE
                  WHEN SUBSTRING(t1."Cell Name"::TEXT, 2, 1) IN ('_', '-')
                    THEN SUBSTRING(t1."Cell Name"::TEXT, 3, 6)
                  ELSE SUBSTRING(t1."Cell Name"::TEXT, 1, 6)
                END,
                '_',
                t1."cellId"
              )
            ${searchByCondition}
          GROUP BY t1."Begin Time", tref.sector, tref.band
          ORDER BY t1."Begin Time", tref.sector, tref.band
    `);

    return result.rows;
  });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tgl2 = params.get("tgl_2") ?? "";

  // ✅ Guard against missing dates early
  if (!params.get("tgl_1") || !tgl2) {
    return Response.json({ error: "Missing required parameters tgl_1 or tgl_2" }, { status: 400 });
  }

  const cacheKey = buildCacheKey(params);
  const CACHE_TTL = getTTL(tgl2);

  try {
    // 1. ✅ Check cache first — always fast
    const cached = await redis.get(cacheKey);
    if (cached) {
      return Response.json({
        rows: cached,
        source: "cache",
        ttl: CACHE_TTL,
      });
    }

    // 2. ✅ Cache miss — fire query in background, respond immediately
    runQuery(params)
      .then((rows) => redis.set(cacheKey, rows, { ex: CACHE_TTL }))
      .catch(console.error);

    // 3. ✅ Tell frontend to retry
    return Response.json(
      {
        rows: [],
        source: "loading",
        message: "Data is being prepared, please retry in 30 seconds",
      },
      { status: 202 },
    );
  } catch (error) {
    console.error("Query error:", error);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }
}

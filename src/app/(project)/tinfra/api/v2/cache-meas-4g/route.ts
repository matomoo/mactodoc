// app/tinfra/api/meas-db-ti-sul/aggregate/meas-dy-dynamic-4g-v3/route.ts

// biome-ignore assist/source/organizeImports: <none>
import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { sql } from "drizzle-orm";
import { db_conn_v2 } from "../../../_drizzle/db_ti_sul";

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
  const field = params.get("fieldToAggregate") ?? "";
  const searchByParams = params.get(field) || "---";

  // Only include params that actually affect the SQL query
  return `meas-dy-4g:${field}:${searchByParams}:${tgl1}:${tgl2}`;
}

async function runQuery(params: URLSearchParams) {
  const tgl1 = params.get("tgl_1");
  const tgl2 = params.get("tgl_2");
  const fieldToAggregate = params.get("fieldToAggregate") || "---";
  const searchByParams = params.get(fieldToAggregate) || "---";

  if (!tgl1 || !tgl2) {
    throw new Error("Missing required date parameters tgl_1 or tgl_2");
  }

  const searchValues = searchByParams.split(",").filter((c) => c.trim() !== "");

  let searchByCondition: unknown;
  if (searchByParams === "---" || searchByParams === "All" || searchValues.length === 0) {
    searchByCondition = sql``;
  } else if (searchValues.length === 1) {
    searchByCondition = sql`AND t1.${sql.raw(fieldToAggregate)} = ${searchValues[0].trim()}`;
  } else {
    const multiSearchList = searchValues.map((c) => `'${c.trim()}'`).join(",");
    searchByCondition = sql`AND t1.${sql.raw(fieldToAggregate)} IN (${sql.raw(multiSearchList)})`;
  }

  return await db_conn_v2.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL work_mem = '64MB'`);
    await tx.execute(sql`SET LOCAL max_parallel_workers_per_gather = 4`);

    const result = await tx.execute(sql`
      SELECT
        t1."Begin Time" AS "BEGIN_TIME",
        t1.${sql.raw(fieldToAggregate)} AS "G4_AGGRBY",
        SUM ( t1."DL Traffic Volume (MByte) AMQ" ) / 1024 AS "DL_PAYLOAD_GB",
        SUM ( t1."UL Traffic Volume (MByte) AMQ" ) / 1024 AS "UL_PAYLOAD_GB",
        SUM ( t1."4G Payload (MByte) AMQ" ) / 1024 AS "TOTAL_PAYLOAD_GB",
        SUM ( t1."4G Payload (MByte) AMQ" ) / 1024 / 1024 AS "TOTAL_PAYLOAD_TB",
        SUM ( t1."Traffic_VoLTE_(erl) AMQ" ) AS "TRAFFIC_VOLTE_ERL",
        SUM ( t1."Traffic_VoLTE_(erl) AMQ" ) / 1024 AS "TRAFFIC_VOLTE_KERL",
        SUM ( t1."Maximum Number of RRC Connection User(unit)" ) AS "G4_SUM_MAX_NUMBER_RRC_CONNECTION_USER",
        SUM ( t1."Cell Availability Num 4G AMQ" ) AS "AVAILABILITY_NUM",
        SUM ( t1."Cell Availability Denum 4G AMQ" ) AS "AVAILABILITY_DENUM",
        SUM ( t1."Num RRC Setup SR AMQ" ) AS "G4_RRC_SETUP_SR_NUM",
        SUM ( t1."Denum RRC Setup SR AMQ" ) AS "G4_RRC_SETUP_SR_DENUM",
        SUM ( t1."Num E-RAB Setup SR AMQ" ) AS "G4_ERAB_SETUP_SR_NUM",
        SUM ( t1."Denum E-RAB Setup SR AMQ" ) AS "G4_ERAB_SETUP_SR_DENUM",
        SUM ( t1."Num CSSR AMQ" ) AS "G4_CSSR_NUM",
        SUM ( t1."Denum CSSR AMQ" ) AS "G4_CSSR_DENUM",
        SUM ( t1."Num Service Drop Rate AMQ" ) AS "G4_SERVICE_DROP_RATE_NUM",
        SUM ( t1."Denum Service Drop Rate AMQ" ) AS "G4_SERVICE_DROP_RATE_DENUM",
        SUM ( t1."DL PRB Utilization Num AMQ" ) AS "G4_DL_PRB_UTILIZATION_NUM",
        SUM ( t1."DL PRB Utilization Denum AMQ" ) AS "G4_DL_PRB_UTILIZATION_DENUM",
        SUM ( t1."UL PRB Utilization Num AMQ" ) AS "G4_UL_PRB_UTILIZATION_NUM",
        SUM ( t1."UL PRB Utilization Denum AMQ" ) AS "G4_UL_PRB_UTILIZATION_DENUM",
        SUM ( t1."User DL Throughput Num AMQ" ) AS "G4_USER_DL_THP_NUM",
        SUM ( t1."User DL Throughput Denum AMQ" ) AS "G4_USER_DL_THP_DENUM",
        SUM ( t1."User UL Throughput Num AMQ" ) AS "G4_USER_UL_THP_NUM",
        SUM ( t1."User UL Throughput Denum AMQ" ) AS "G4_USER_UL_THP_DENUM",
        SUM ( t1."DL RB Available AMQ" ) AS "G4_DL_RB_AVAILABLE",
        SUM ( t1."spectrum efficiency num" ) AS "G4_SE_NUM",
        SUM ( t1."spectrum efficiency denum" ) AS "G4_SE_DENUM",
        SUM ( t1."Num Average CQI_Rev" ) AS "G4_AVG_CQI_NUM",
        SUM ( t1."Denum Average CQI_Rev" ) AS "G4_AVG_CQI_DENUM",
        AVG ( t1."Average NI of Carrier(dBm)" ) AS "G4_AVG_NI_CARRIER_DBM",
        SUM ( t1."Num CSFB SR AMQ" ) AS "G4_CSFB_SETUP_SR_NUM",
        SUM ( t1."Denum CSFB SR AMQ" ) AS "G4_CSFB_SETUP_SR_DENUM",
        SUM ( t1."Num IFHO SR AMQ" ) AS "G4_IFHO_SR_NUM",
        SUM ( t1."Denum IFHO SR AMQ" ) AS "G4_IFHO_SR_DENUM",
        SUM ( t1."Inter_Freq_HOSR_VoLTE_Num AMQ" ) AS "G4_INTER_FHO_SR_NUM",
        SUM ( t1."Inter_Freq_HOSR_VoLTE_Denum AMQ" ) AS "G4_INTER_FHO_SR_DENUM",
        SUM ( t1."SRVCC_LTE-GSM_HOSR_VoLTE_Num AMQ" ) AS "G4_SRVCC_E2G_SR_NUM",
        SUM ( t1."SRVCC_LTE-GSM_HOSR_VoLTE_Denum AMQ" ) AS "G4_SRVCC_E2G_SR_DENUM",
        SUM ( t1."SRVCC_LTE-UMTS_HOSR_VoLTE_Num AMQ" ) AS "G4_SRVCC_E2W_SR_NUM",
        SUM ( t1."SRVCC_LTE-UMTS_HOSR_VoLTE_Denum AMQ" ) AS "G4_SRVCC_E2W_SR_DENUM",
        '1' AS "DENUMBY1" 
      FROM
        mv_4g_meas_summary t1 
      WHERE
        t1."Begin Time" >= ${tgl1} :: TIMESTAMP
        AND t1."Begin Time" <= ${tgl2} :: TIMESTAMP
        ${searchByCondition}
      GROUP BY
        t1."Begin Time",
        t1.${sql.raw(fieldToAggregate)}
      ORDER BY
        t1."Begin Time",
        t1.${sql.raw(fieldToAggregate)}
    `);

    return result.rows;
  });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tgl2 = params.get("tgl_2") ?? "";

  if (!params.get("tgl_1") || !tgl2) {
    return Response.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const cacheKey = buildCacheKey(params);
  const CACHE_TTL = getTTL(tgl2);

  try {
    // 1. ✅ Check cache FIRST — this was removed in your update!
    const cached = await redis.get(cacheKey);
    if (cached) {
      return Response.json({ rows: cached, source: "cache", ttl: CACHE_TTL });
    }

    // 2. ✅ Check if query is already running — prevent duplicate queries!
    const existingMeta = await redis.get(`${cacheKey}:meta`);
    if (existingMeta) {
      return Response.json(
        {
          rows: [],
          source: "loading",
          startedAt: (existingMeta as { startedAt: number }).startedAt,
          message: "Query is already running...",
        },
        { status: 202 },
      );
    }

    // 3. ✅ Only now fire the background query
    const jobMeta = { status: "loading", startedAt: Date.now() };
    await redis.set(`${cacheKey}:meta`, jobMeta, { ex: 300 });

    runQuery(params)
      .then(async (rows) => {
        await redis.set(cacheKey, rows, { ex: CACHE_TTL });
        await redis.del(`${cacheKey}:meta`); // ✅ clean up meta when done
      })
      .catch(async (err) => {
        await redis.set(
          `${cacheKey}:meta`,
          { status: "error", error: String(err), startedAt: jobMeta.startedAt },
          { ex: 60 },
        );
        console.error(err);
      });

    return Response.json(
      {
        rows: [],
        source: "loading",
        startedAt: jobMeta.startedAt,
        message: "Query is running...",
      },
      { status: 202 },
    );
  } catch (error) {
    console.error("Query error:", error);
    return Response.json({ error: "Query failed" }, { status: 500 });
  }
}

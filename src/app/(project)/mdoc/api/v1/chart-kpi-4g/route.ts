// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v1 } from "@/app/(project)/mdoc/_drizzle/db_mdoc";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const siteid = searchParams.get("siteid");
  const band = searchParams.get("band");
  const city = searchParams.get("city");
  const beforeDay1 = searchParams.get("beforeDay1");
  const afterDay3 = searchParams.get("afterDay3");

  if (!siteid || !city || !beforeDay1 || !afterDay3) {
    return NextResponse.json(
      {
        error: "Missing required params: siteid, band, city, beforeDay1, afterDay3",
      },
      { status: 400 },
    );
  }

  try {
    const result = await db_conn_v1.execute<Data2G4GModel>(sql`
            SELECT
                d."Begin Time" AS begin_time,

                CONCAT(
                    'Sector-',
                    RIGHT(d.sector, 1),
                    ' - ',
                    d.short_band,
                    '1'
                ) AS group_by,

                SUM(d."Cell Availability Num 4G AMQ")
                    / NULLIF(SUM(d."Cell Availability Denum 4G AMQ"), 0) * 100
                    AS availability,

                SUM(d."Num RRC Setup SR AMQ")
                    / NULLIF(SUM(d."Denum RRC Setup SR AMQ"), 0) * 100
                    AS rrc_setup,

                SUM(d."Num E-RAB Setup SR AMQ")
                    / NULLIF(SUM(d."Denum E-RAB Setup SR AMQ"), 0) * 100
                    AS erab_setup,

                SUM(d."Num CSSR AMQ")
                    / NULLIF(SUM(d."Denum CSSR AMQ"), 0) * 100
                    AS cssr,

                SUM(d."Num E-RAB Drop AMQ")
                    / NULLIF(SUM(d."Denum E-RAB Drop AMQ"), 0)
                    AS erab_drop,

                SUM(d."Num IFHO SR AMQ")
                    / NULLIF(SUM(d."Denum IFHO SR AMQ"), 0) * 100
                    AS ifho,

                SUM(d."Num CSFB SR AMQ")
                    / NULLIF(SUM(d."Denum CSFB SR AMQ"), 0) * 100
                    AS csfb,

                AVG(d."CQI Average AMQ") AS cqi_average,

                AVG(d."FDD Spectral Efficiency 2") AS se2,

                SUM(
                    d."Number of Redirection Requests from LTE to GSM(CSFB)"
                ) AS number_csfb,

                AVG(d."Average NI of Carrier(dBm)") AS ni_carrier,

                AVG(d."Average Cell RSSI(dBm)") AS rssi,

                SUM(d."Total Payload CA_(MByte) AMQ") AS payload_ca,

                COALESCE(SUM(v.volte_traffic), 0) AS volte_traffic

            FROM meas_4g_dy d

            LEFT JOIN (
                SELECT
                    "Begin Time",
                    "eNodeBId",
                    "cellId",
                    SUM("[VoLTE]_Traffic (Erl)_TJH") AS volte_traffic
                FROM meas_4g_volte
                WHERE
                    "Begin Time" BETWEEN ${beforeDay1} AND ${afterDay3}
                GROUP BY
                    "Begin Time",
                    "eNodeBId",
                    "cellId"
            ) v
                ON v."Begin Time" = d."Begin Time"
                AND v."eNodeBId" = d."eNodeBId"
                AND v."cellId" = d."cellId"

            WHERE
                d.siteid = ${siteid}
                AND d."Begin Time" BETWEEN ${beforeDay1} AND ${afterDay3}

            GROUP BY
                d."Begin Time",
                d.siteid_cellid,
                d.sector,
                d.short_band;
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

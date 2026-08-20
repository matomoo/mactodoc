import { NextResponse } from "next/server";

import { sql } from "drizzle-orm";

import { db_conn_v1 } from "@/app/(project)/mdoc/_drizzle/db_mdoc";

// GET all + filter by wid + POST create
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wid = searchParams.get("wid");

    let query = sql`SELECT * FROM sqac_dt_report`;
    if (wid) {
      query = sql`SELECT * FROM sqac_dt_report WHERE wid = ${wid}`;
    }
    query = sql`${query} ORDER BY wid`;

    const result = await db_conn_v1.execute(query);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await db_conn_v1.execute(sql`
      INSERT INTO sqac_dt_report (
        wid, dt_rsrp, dt_sinr, dt_dl_thp,
        long_nodin, long_audit_before, long_audit_after,
        lat_nodin, lat_audit_before, lat_audit_after,
        antenna_type_s1, antenna_type_s2, antenna_type_s3,
        antenna_height_s1, antenna_height_s2, antenna_height_s3,
        antenna_mt_s1, antenna_mt_s2, antenna_mt_s3,
        antenna_et_s1, antenna_et_s2, antenna_et_s3,
        pci,
        antenna_azm_s1, antenna_azm_s2, antenna_azm_s3
      ) VALUES (
        ${body.wid || ""},
        ${body.dt_rsrp || ""},
        ${body.dt_sinr || ""},
        ${body.dt_dl_thp || ""},
        ${body.long_nodin || ""},
        ${body.long_audit_before || ""},
        ${body.long_audit_after || ""},
        ${body.lat_nodin || ""},
        ${body.lat_audit_before || ""},
        ${body.lat_audit_after || ""},
        ${body.antenna_type_s1 || ""},
        ${body.antenna_type_s2 || ""},
        ${body.antenna_type_s3 || ""},
        ${body.antenna_height_s1 || ""},
        ${body.antenna_height_s2 || ""},
        ${body.antenna_height_s3 || ""},
        ${body.antenna_mt_s1 || ""},
        ${body.antenna_mt_s2 || ""},
        ${body.antenna_mt_s3 || ""},
        ${body.antenna_et_s1 || ""},
        ${body.antenna_et_s2 || ""},
        ${body.antenna_et_s3 || ""},
        ${body.pci || ""},
        ${body.antenna_azm_s1 || ""},
        ${body.antenna_azm_s2 || ""},
        ${body.antenna_azm_s3 || ""}
      )
      ON CONFLICT (wid) DO UPDATE SET
        dt_rsrp = EXCLUDED.dt_rsrp,
        dt_sinr = EXCLUDED.dt_sinr,
        dt_dl_thp = EXCLUDED.dt_dl_thp,
        long_nodin = EXCLUDED.long_nodin,
        long_audit_before = EXCLUDED.long_audit_before,
        long_audit_after = EXCLUDED.long_audit_after,
        lat_nodin = EXCLUDED.lat_nodin,
        lat_audit_before = EXCLUDED.lat_audit_before,
        lat_audit_after = EXCLUDED.lat_audit_after,
        antenna_type_s1 = EXCLUDED.antenna_type_s1,
        antenna_type_s2 = EXCLUDED.antenna_type_s2,
        antenna_type_s3 = EXCLUDED.antenna_type_s3,
        antenna_height_s1 = EXCLUDED.antenna_height_s1,
        antenna_height_s2 = EXCLUDED.antenna_height_s2,
        antenna_height_s3 = EXCLUDED.antenna_height_s3,
        antenna_mt_s1 = EXCLUDED.antenna_mt_s1,
        antenna_mt_s2 = EXCLUDED.antenna_mt_s2,
        antenna_mt_s3 = EXCLUDED.antenna_mt_s3,
        antenna_et_s1 = EXCLUDED.antenna_et_s1,
        antenna_et_s2 = EXCLUDED.antenna_et_s2,
        antenna_et_s3 = EXCLUDED.antenna_et_s3,
        pci = EXCLUDED.pci,
        antenna_azm_s1 = EXCLUDED.antenna_azm_s1,
        antenna_azm_s2 = EXCLUDED.antenna_azm_s2,
        antenna_azm_s3 = EXCLUDED.antenna_azm_s3
      RETURNING *
    `);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

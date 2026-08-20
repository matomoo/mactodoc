import { NextResponse } from "next/server";

import { sql } from "drizzle-orm";

import { db_conn_v1 } from "@/app/(project)/mdoc/_drizzle/db_mdoc";

// GET by wid
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await db_conn_v1.execute(sql`SELECT * FROM sqac_dt_report WHERE wid = ${id}`);
    return NextResponse.json(result.rows[0] || null);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// PUT update by wid
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await db_conn_v1.execute(sql`
      UPDATE sqac_dt_report SET
        dt_rsrp = ${body.dt_rsrp || ""},
        dt_sinr = ${body.dt_sinr || ""},
        dt_dl_thp = ${body.dt_dl_thp || ""},
        long_nodin = ${body.long_nodin || ""},
        long_audit_before = ${body.long_audit_before || ""},
        long_audit_after = ${body.long_audit_after || ""},
        lat_nodin = ${body.lat_nodin || ""},
        lat_audit_before = ${body.lat_audit_before || ""},
        lat_audit_after = ${body.lat_audit_after || ""},
        antenna_type_s1 = ${body.antenna_type_s1 || ""},
        antenna_type_s2 = ${body.antenna_type_s2 || ""},
        antenna_type_s3 = ${body.antenna_type_s3 || ""},
        antenna_height_s1 = ${body.antenna_height_s1 || ""},
        antenna_height_s2 = ${body.antenna_height_s2 || ""},
        antenna_height_s3 = ${body.antenna_height_s3 || ""},
        antenna_mt_s1 = ${body.antenna_mt_s1 || ""},
        antenna_mt_s2 = ${body.antenna_mt_s2 || ""},
        antenna_mt_s3 = ${body.antenna_mt_s3 || ""},
        antenna_et_s1 = ${body.antenna_et_s1 || ""},
        antenna_et_s2 = ${body.antenna_et_s2 || ""},
        antenna_et_s3 = ${body.antenna_et_s3 || ""},
        pci = ${body.pci || ""},
        antenna_azm_s1 = ${body.antenna_azm_s1 || ""},
        antenna_azm_s2 = ${body.antenna_azm_s2 || ""},
        antenna_azm_s3 = ${body.antenna_azm_s3 || ""}
      WHERE wid = ${id}
      RETURNING *
    `);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// DELETE by wid
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db_conn_v1.execute(sql`DELETE FROM sqac_dt_report WHERE wid = ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

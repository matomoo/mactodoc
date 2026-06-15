// biome-ignore assist/source/organizeImports: <will fix later>
import { db_conn_v1 } from "@/app/(project)/tinfra/_drizzle/db_mdoc";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

// PUT update - uses path param /activity-log/[id] where id is URL-encoded composite key
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Decode composite key: siteid|tanggal|band
    const decoded = decodeURIComponent(id);
    const [siteid, tanggal, band] = decoded.split("|");

    const body = await request.json();

    const result = await db_conn_v1.execute(sql`
      UPDATE activity_log SET
        deskripsi = ${body.deskripsi || ""}
      WHERE siteid = ${siteid} AND tanggal = ${tanggal} AND band = ${band}
      RETURNING *
    `);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// DELETE - uses path param /activity-log/[id] where id is URL-encoded composite key
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Decode composite key: siteid|tanggal|band
    const decoded = decodeURIComponent(id);
    const [siteid, tanggal, band] = decoded.split("|");

    await db_conn_v1.execute(sql`
      DELETE FROM activity_log WHERE siteid = ${siteid} AND tanggal = ${tanggal} AND band = ${band}
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

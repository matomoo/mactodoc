// biome-ignore assist/source/organizeImports: <will fix later>
import { db_conn_v1 } from "@/app/(project)/tinfra/_drizzle/db_mdoc";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

// GET all
export async function GET() {
  const result = await db_conn_v1.execute(sql`
    SELECT * FROM sqac_tracker ORDER BY created_at DESC
  `);

  return NextResponse.json(result.rows);
}

// POST create
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await db_conn_v1.execute(sql`
      INSERT INTO sqac_tracker (wid, site, band, connected, audit, dt, sqac_status, sqac_remark)
      VALUES (
        ${body.wid || ""},
        ${body.site || ""},
        ${body.band || ""},
        ${body.connected || null},
        ${body.audit || null},
        ${body.dt || null},
        ${body.sqac_status || ""},
        ${body.sqac_remark || ""}
      )
      RETURNING *
    `);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// biome-ignore assist/source/organizeImports: <will fix later>
import { db_conn_v1 } from "@/app/(project)/tinfra/_drizzle/db_mdoc";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

// GET all (optionally filter by wid query param)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wid = searchParams.get("wid");

  let query = sql`SELECT * FROM sqac_tracker`;
  if (wid) {
    query = sql`SELECT * FROM sqac_tracker WHERE wid = ${wid}`;
  }
  query = sql`${query} ORDER BY created_at DESC`;

  const result = await db_conn_v1.execute(query);

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
        ${body.type_of_work || ""}
        ${body.tac || ""}
        ${body.city || ""}
        ${body.band_impact || ""}
      )
      RETURNING *
    `);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

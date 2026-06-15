// biome-ignore assist/source/organizeImports: <will fix later>
import { db_conn_v1 } from "@/app/(project)/tinfra/_drizzle/db_mdoc";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

// GET all (optionally filter by siteid query param)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteid = searchParams.get("siteid");

  let query = sql`SELECT * FROM activity_log`;
  if (siteid) {
    query = sql`SELECT * FROM activity_log WHERE siteid = ${siteid}`;
  }
  query = sql`${query} ORDER BY tanggal DESC`;

  const result = await db_conn_v1.execute(query);

  return NextResponse.json(result.rows);
}

// POST create
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await db_conn_v1.execute(sql`
      INSERT INTO activity_log (tanggal, siteid, band, deskripsi)
      VALUES (
        ${body.tanggal || null},
        ${body.siteid || ""},
        ${body.band || ""},
        ${body.deskripsi || ""}
      )
      RETURNING *
    `);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

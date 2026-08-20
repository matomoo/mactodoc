// biome-ignore assist/source/organizeImports: <will fix later>
import { db_conn_v1 } from "@/app/(project)/mdoc/_drizzle/db_mdoc";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

// GET all (optionally filter by siteid or wid query param)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wid = searchParams.get("wid");
  const siteid = searchParams.get("siteid");

  let trackerSiteid: string | null = null;

  // Query sqac_tracker to get siteid based on wid
  if (wid) {
    const trackerResult = await db_conn_v1.execute(sql`
      SELECT siteid FROM sqac_tracker WHERE wid = ${wid} LIMIT 1
    `);
    const rowSiteid = trackerResult.rows[0]?.siteid;
    trackerSiteid = typeof rowSiteid === "string" ? rowSiteid : null;
  }

  // Filter by siteid
  if (trackerSiteid) {
    const result = await db_conn_v1.execute(sql`
      SELECT * FROM activity_log WHERE siteid = ${trackerSiteid} ORDER BY tanggal DESC
    `);
    return NextResponse.json(result.rows);
  }
  if (siteid) {
    const result = await db_conn_v1.execute(sql`
      SELECT * FROM activity_log WHERE siteid = ${siteid} ORDER BY tanggal DESC
    `);
    return NextResponse.json(result.rows);
  }

  // Return all data if no filter
  const result = await db_conn_v1.execute(sql`
    SELECT * FROM activity_log ORDER BY tanggal DESC
  `);
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

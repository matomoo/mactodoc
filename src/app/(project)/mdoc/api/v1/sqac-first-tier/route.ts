// biome-ignore assist/source/organizeImports: <will fix later>
import { db_conn_v1 } from "@/app/(project)/tinfra/_drizzle/db_mdoc";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

// GET all
export async function GET() {
  const result = await db_conn_v1.execute(sql`
    SELECT * FROM sqac_first_tier ORDER BY siteid_main, siteid_tier, sector_tier
  `);

  return NextResponse.json(result.rows);
}

// POST create
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await db_conn_v1.execute(sql`
      INSERT INTO sqac_first_tier (
        siteid_main, siteid_tier, sector_tier, remark
      )
      VALUES (
        ${body.siteid_main || ""},
        ${body.siteid_tier || ""},
        ${body.sector_tier || ""},
        ${body.remark || ""}
      )
      RETURNING *
    `);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

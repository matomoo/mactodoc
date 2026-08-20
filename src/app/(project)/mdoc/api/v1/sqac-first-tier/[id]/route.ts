// biome-ignore assist/source/organizeImports: <will fix later>
import { db_conn_v1 } from "@/app/(project)/mdoc/_drizzle/db_mdoc";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

// PUT update - uses path param /sqac-first-tier/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const body = await request.json();

    const result = await db_conn_v1.execute(sql`
      UPDATE sqac_first_tier SET
        siteid_main = ${body.siteid_main || ""},
        siteid_tier = ${body.siteid_tier || ""},
        sector_tier = ${body.sector_tier || ""},
        remark = ${body.remark || ""}
      WHERE id = ${id}
      RETURNING *
    `);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// DELETE - uses path param /sqac-first-tier/[id]
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await db_conn_v1.execute(sql`
      DELETE FROM sqac_first_tier WHERE id = ${id}
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

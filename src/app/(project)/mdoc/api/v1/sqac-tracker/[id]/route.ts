// biome-ignore assist/source/organizeImports: <will fix later>
import { db_conn_v1 } from "@/app/(project)/tinfra/_drizzle/db_mdoc";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

// PUT update - uses path param /sqac-tracker/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const body = await request.json();

    const result = await db_conn_v1.execute(sql`
      UPDATE sqac_tracker SET
        wid = ${body.wid || ""},
        siteid = ${body.siteid || ""},
        band_4g_sow = ${body.band_4g_sow || ""},
        band_2g_sow = ${body.band_2g_sow || ""},
        connected = ${body.connected || null},
        audit = ${body.audit || null},
        dt = ${body.dt || null},
        sqac_status = ${body.sqac_status || ""},
        sqac_remark = ${body.sqac_remark || ""},
        type_of_work = ${body.type_of_work || ""},
        tac = ${body.tac || ""},
        site_name_4g = ${body.site_name_4g || ""},
        site_name_2g = ${body.site_name_2g || ""},
        enodeb_id = ${body.enodeb_id || ""},
        cell_id_4g = ${body.cell_id_4g || ""},
        cell_id_2g = ${body.cell_id_2g || ""},
        longitude = ${body.longitude || ""},
        latitude = ${body.latitude || ""},
        kabupaten = ${body.kabupaten || ""},
        lac_2g = ${body.lac_2g || ""},
        site_no_2g = ${body.site_no_2g || ""},
        trx_configuration = ${body.trx_configuration || ""}
      WHERE id = ${id}
      RETURNING *
    `);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// DELETE - uses path param /sqac-tracker/[id]
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await db_conn_v1.execute(sql`
      DELETE FROM sqac_tracker WHERE id = ${id}
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

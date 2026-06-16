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
      INSERT INTO sqac_tracker (
        wid, siteid, band_4g_sow, connected, audit, dt, sqac_status, sqac_remark,
        type_of_work, tac, band_2g_sow, site_name_4g, site_name_2g,
        enodeb_id, cell_id_4g, cell_id_2g, longitude, latitude, kabupaten, lac_2g, site_no_2g, trx_configuration
      )
      VALUES (
        ${body.wid || ""},
        ${body.siteid || ""},
        ${body.band_4g_sow || ""},
        ${body.connected || null},
        ${body.audit || null},
        ${body.dt || null},
        ${body.sqac_status || ""},
        ${body.sqac_remark || ""},
        ${body.type_of_work || ""},
        ${body.tac || ""},
        ${body.band_2g_sow || ""},
        ${body.site_name_4g || ""},
        ${body.site_name_2g || ""},
        ${body.enodeb_id || ""},
        ${body.cell_id_4g || ""},
        ${body.cell_id_2g || ""},
        ${body.longitude || ""},
        ${body.latitude || ""},
        ${body.kabupaten || ""},
        ${body.lac_2g || ""},
        ${body.site_no_2g || ""},
        ${body.trx_configuration || ""}
      )
      RETURNING *
    `);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

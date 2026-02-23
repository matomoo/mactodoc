// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v2 } from "../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId") || "---";
  const tgl_1 = searchParams.get("tgl_1");
  const tgl_2 = searchParams.get("tgl_2");

  console.log("siteId request ke db", siteId);

  if (!tgl_1 || !tgl_2) {
    return NextResponse.json({ error: "Both tgl_1 and tgl_2 parameters are required" }, { status: 400 });
  }

  let formattedTgl1: string;
  let formattedTgl2: string;
  const querySiteId = `%${siteId.toUpperCase()}%`;

  try {
    formattedTgl1 = new Date(tgl_1).toISOString();
    formattedTgl2 = new Date(tgl_2).toISOString();

    const result = await db_conn_v2.execute<Data2G4GModel>(sql`
      SELECT
            t1."Cell Name" AS "G4_CELL_NAME",
            t1."cellId" AS "G4_CELLID"
          FROM
            "measDy4g" t1
          WHERE
            t1."Begin Time" = ${formattedTgl1} :: TIMESTAMP
          AND
           t1."Cell Name" like ${querySiteId}    
      
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// SELECT
//             t1."week" AS "G4_WEEK",
//             t1."siteid" AS "G4_SITEID",
//             t1."cellid" AS "G4_CELLID",
//             t1."band" AS "G4_BAND",
//             t1."subnetwork_id" AS "G4_SUBNETWORK_ID",
//             t1."managedelement_id" AS "G4_ME_ID",
//             t1."enodeb_id" AS "G4_ENODEB_ID",
//             t1."siteid_cellid" AS "G4_SITEID_CELLID",
//             t1."cell_name" AS "G4_CELL_NAME",
//             t1."kabupaten" AS "G4_KABUPATEN",
//             t1."nop" AS "G4_NOP"
//           FROM
//             "ref_cell_4g" t1
//           WHERE
//            t1."siteid" like ${querySiteId}

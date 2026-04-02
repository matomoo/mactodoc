// app/api/ref-query-cluster/route.ts
// biome-ignore assist/source/organizeImports: <none>
import { db_conn_v2 } from "../../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET method - fetch data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nama_nop = searchParams.get("nama_nop");

    let query = sql`SELECT DISTINCT nop FROM ref_cell_4g ORDER BY nop`;

    // Add filters if provided
    if (nama_nop) {
      query = sql`
        SELECT DISTINCT nop FROM ref_cell_4g 
        WHERE nop = ${nama_nop}
      `;
    }

    const result = await db_conn_v2.execute(query);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

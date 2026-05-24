// app/api/ref-query-cluster/route.ts
// biome-ignore assist/source/organizeImports: <none>
import { db_conn_v2 } from "../../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET method - fetch data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchByThis = searchParams.get("searchByThis");
    const fieldToSearch = searchParams.get("fieldToSearch");
    const searchNop = searchParams.get("nop");
    const searchKabupaten = searchParams.get("kabupaten");
    const searchKecamatan = searchParams.get("kecamatan");

    // Validate fieldToSearch to prevent SQL injection
    const allowedFields = ["kabupaten", "kecamatan", "nop", "siteid", "region"];
    if (!fieldToSearch || !allowedFields.includes(fieldToSearch)) {
      return NextResponse.json({ error: "Invalid field parameter" }, { status: 400 });
    }

    // biome-ignore lint/suspicious/noExplicitAny: <none>
    let query: any;
    if (fieldToSearch === "kabupaten" && searchNop !== "---") {
      // When searching for specific value, return matching records
      query = sql`
        SELECT DISTINCT ${sql.raw(fieldToSearch)} FROM ref_cell_4g 
        WHERE nop = ${searchNop}
        AND remark IS NULL
        ORDER BY ${sql.raw(fieldToSearch)}
      `;
    } else if (fieldToSearch === "kecamatan" && searchNop !== "---" && searchKabupaten !== "---") {
      // When searching for specific value, return matching records
      query = sql`
        SELECT DISTINCT ${sql.raw(fieldToSearch)} FROM ref_cell_4g 
        WHERE nop = ${searchNop}
        AND kabupaten = ${searchKabupaten}
        AND remark IS NULL
        ORDER BY ${sql.raw(fieldToSearch)}
      `;
    } else {
      // When no specific search, return all distinct values
      query = sql`
        SELECT DISTINCT ${sql.raw(fieldToSearch)} FROM ref_cell_4g 
        WHERE remark IS NULL
        ORDER BY ${sql.raw(fieldToSearch)}
      `;
    }

    const result = await db_conn_v2.execute(query);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

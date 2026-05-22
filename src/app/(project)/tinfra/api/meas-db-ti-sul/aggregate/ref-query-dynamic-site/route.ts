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
    const fieldToSearch1 = searchParams.get("fieldToSearch1");
    const fieldToSearch2 = searchParams.get("fieldToSearch2");
    const searchNop = searchParams.get("nop");
    const searchKabupaten = searchParams.get("kabupaten");

    // Validate fieldToSearch to prevent SQL injection
    const allowedFields = ["kabupaten", "kecamatan", "nop", "siteid", "region"];
    if (!fieldToSearch1 || !fieldToSearch2 || !allowedFields.includes(fieldToSearch1)) {
      return NextResponse.json({ error: "Invalid field parameter" }, { status: 400 });
    }

    // console.log({ searchNop, fieldToSearch1, fieldToSearch2 });

    // biome-ignore lint/suspicious/noExplicitAny: <none>
    let query: any;
    if (fieldToSearch1 === "siteid" && searchNop !== "---" && searchKabupaten !== "---") {
      // When searching for specific value, return matching records
      query = sql`
        SELECT DISTINCT ${sql.raw(fieldToSearch1)} FROM ref_cell_4g 
        WHERE ${sql.raw(fieldToSearch2)} = ${searchKabupaten}
        AND remark IS NULL
        ORDER BY ${sql.raw(fieldToSearch1)}
      `;
    } else {
      // When no specific search, return all distinct values
      query = sql`
        SELECT DISTINCT ${sql.raw(fieldToSearch1)} FROM ref_cell_4g 
        WHERE remark IS NULL
        ORDER BY ${sql.raw(fieldToSearch1)}
      `;
    }

    const result = await db_conn_v2.execute(query);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

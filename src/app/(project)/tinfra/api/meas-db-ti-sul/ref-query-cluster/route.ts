// app/api/ref-query-cluster/route.ts
// biome-ignore assist/source/organizeImports: <none>
import { db_conn_v2 } from "../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET method - fetch data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nama_cluster = searchParams.get("nama_cluster");
    const siteid = searchParams.get("siteid");

    let query = sql`SELECT * FROM ref_query_cluster`;

    // Add filters if provided
    if (nama_cluster || siteid) {
      query = sql`
        SELECT * FROM ref_query_cluster 
        WHERE 1=1
        ${nama_cluster ? sql`AND nama_cluster = ${nama_cluster}` : sql``}
        ${siteid ? sql`AND siteid = ${siteid}` : sql``}
      `;
    }

    const result = await db_conn_v2.execute(query);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// POST method - insert data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama_cluster, siteid } = body;

    if (!nama_cluster || !siteid) {
      return NextResponse.json({ error: "Both nama_cluster and siteid are required" }, { status: 400 });
    }

    const result = await db_conn_v2.execute(sql`
      INSERT INTO ref_query_cluster (nama_cluster, siteid)
      VALUES (${nama_cluster}, ${siteid})
      RETURNING *
    `);

    return NextResponse.json(
      {
        message: "Data inserted successfully",
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

// DELETE method - delete data
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nama_cluster = searchParams.get("nama_cluster");
    const siteid = searchParams.get("siteid");

    if (!nama_cluster || !siteid) {
      return NextResponse.json({ error: "Both nama_cluster and siteid parameters are required" }, { status: 400 });
    }

    const result = await db_conn_v2.execute(sql`
      DELETE FROM ref_query_cluster
      WHERE nama_cluster = ${nama_cluster} 
        AND siteid = ${siteid}
      RETURNING *
    `);

    if (Array.isArray(result) && result.length === 0) {
      return NextResponse.json({ error: "No matching record found to delete" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Data deleted successfully",
      data: result,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

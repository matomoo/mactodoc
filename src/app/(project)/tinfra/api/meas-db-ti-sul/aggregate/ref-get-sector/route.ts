// app/api/ref-query-cluster/route.ts
/** biome-ignore-all lint/suspicious/noExplicitAny: <none> */
// biome-ignore assist/source/organizeImports: <none>
import { db_conn_v2 } from "../../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET method - fetch data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // const searchByThis = searchParams.get("searchByThis");
    // const fieldToSearch = searchParams.get("fieldToSearch");
    const multiSite = searchParams.get("siteId") || "---";

    const multiSiteValues = multiSite.split(",").filter((c) => c.trim() !== "");

    let multiSiteCondition: any;
    if (multiSite === "---" || multiSite === "All" || multiSiteValues.length === 0) {
      multiSiteCondition = sql``;
    } else if (multiSiteValues.length === 1) {
      // Use exact match for single cluster
      multiSiteCondition = sql`siteid = ${multiSiteValues[0].trim()}`;
    } else {
      // For multiple clusters, build the IN clause using raw SQL
      const multiSiteList = multiSiteValues.map((c) => `'${c.trim()}'`).join(",");
      multiSiteCondition = sql.raw(`siteid IN (${multiSiteList})`);
    }

    const query: any = sql`
        SELECT DISTINCT siteid_cellid AS "G4_SITEID_CELLID", sector AS "G4_SITEID_SECTOR" 
        FROM ref_cell_4g 
        WHERE
        ${multiSiteCondition}
        ORDER BY siteid_cellid, sector
      `;

    const result = await db_conn_v2.execute(query);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

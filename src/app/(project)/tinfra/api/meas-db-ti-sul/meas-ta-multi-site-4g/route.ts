// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import { db_conn_v2 } from "../../../_drizzle/db_ti_sul";
import { sql } from "drizzle-orm";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  //   const siteId = searchParams.get("siteId") || "---";
  const tgl_1 = searchParams.get("tgl_1");
  const tgl_2 = searchParams.get("tgl_2");
  const multiSite = searchParams.get("siteId") || "---";

  if (!tgl_1 || !tgl_2) {
    return NextResponse.json({ error: "Both tgl_1 and tgl_2 parameters are required" }, { status: 400 });
  }

  let formattedTgl1: string;
  let formattedTgl2: string;
  //   const querySiteId = `%${siteId.toUpperCase()}%`;

  try {
    formattedTgl1 = new Date(tgl_1).toISOString();
    formattedTgl2 = new Date(tgl_2).toISOString();
    const multiSiteValues = multiSite.split(",").filter((c) => c.trim() !== "");

    // biome-ignore lint/suspicious/noExplicitAny: <none>
    let multiSiteCondition: any;
    if (multiSite === "---" || multiSite === "All" || multiSiteValues.length === 0) {
      multiSiteCondition = sql``;
    } else if (multiSiteValues.length === 1) {
      // Use exact match for single cluster
      multiSiteCondition = sql`tref.siteid = ${multiSiteValues[0].trim()}`;
    } else {
      // For multiple clusters, build the IN clause using raw SQL
      const multiSiteList = multiSiteValues.map((c) => `'${c.trim()}'`).join(",");
      multiSiteCondition = sql.raw(`tref.siteid IN (${multiSiteList})`);
    }

    const result = await db_conn_v2.execute<Data2G4GModel>(sql`
            SELECT 
                tref.siteid AS "siteid",
                tref.siteid_cellid AS "siteid_cellid",
                t1."cellId",
                CASE 
                    WHEN LENGTH(t1."cellId"::TEXT) = 3 THEN 
                        LEFT(t1."cellId"::TEXT, 2)
                    ELSE 
                        LEFT(t1."cellId"::TEXT, 1)
                END AS "sector",
                ta_range,
                sort_order,
                SUM(report_times) AS total_reports
            FROM "measTa4g" t1
            INNER JOIN ref_cell_4g tref ON tref.siteid_cellid = CONCAT(
                CASE 
                    WHEN SUBSTRING(t1."eNodeB Name"::TEXT, 2, 1) IN ('_', '-') THEN 
                        SUBSTRING(t1."eNodeB Name"::TEXT, 3, 6) 
                    ELSE 
                        SUBSTRING(t1."eNodeB Name"::TEXT, 1, 6) 
                END,
                '_',
                t1."cellId"
            )
            CROSS JOIN LATERAL (
                VALUES 
                    ('TA Value 1 (0-78m)', 1, t1."Report Times of TA Value 1 (0-78m)"),
                    ('TA Value 2 (78-234m)', 2, t1."Report Times of TA Value 2 (78-234m)"),
                    ('TA Value 3 (234-390m)', 3, t1."Report Times of TA Value 3 (234-390m)"),
                    ('TA Value 4 (390-546m)', 4, t1."Report Times of TA Value 4 (390-546m)"),
                    ('TA Value 5 (546-702m)', 5, t1."Report Times of TA Value 5 (546-702m)"),
                    ('TA Value 6 (702-858m)', 6, t1."Report Times of TA Value 6 (702-858m)"),
                    ('TA Value 7 (858-1014m)', 7, t1."Report Times of TA Value 7 (858-1014m)"),
                    ('TA Value 8 (1014-1560m)', 8, t1."Report Times of TA Value 8 (1014-1560m)"),
                    ('TA Value 9 (1560-2106m)', 9, t1."Report Times of TA Value 9 (1560-2106m)"),
                    ('TA Value 10 (2106-2652m)', 10, t1."Report Times of TA Value 10 (2106-2652m)"),
                    ('TA Value 11 (2652-3198m)', 11, t1."Report Times of TA Value 11 (2652-3198m)"),
                    ('TA Value 12 (3198-4212m)', 12, t1."Report Times of TA Value 12 (3198-4212m)"),
                    ('TA Value 13 (4212-6708m)', 13, t1."Report Times of TA Value 13 (4212-6708m)"),
                    ('TA Value 14 (6708-10608m)', 14, t1."Report Times of TA Value 14 (6708-10608m)"),
                    ('TA Value 15 (> 10608m)', 15, t1."Report Times of TA Value 15 (> 10608m)")
            ) AS v(ta_range, sort_order, report_times)
            WHERE 
                ${multiSiteCondition}
                AND t1."Begin Time" >= ${formattedTgl1} 
                AND t1."Begin Time" <= ${formattedTgl2}
            GROUP BY 
                tref.siteid,
                tref.siteid_cellid,
                t1."cellId",
                ta_range, 
                sort_order
            ORDER BY 
                tref.siteid_cellid,
                sort_order;
        `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

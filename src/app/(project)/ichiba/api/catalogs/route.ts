// src/app/api/catalogs/route.ts
// biome-ignore assist/source/organizeImports: <none>
import { type NextRequest, NextResponse } from "next/server";
import { eq, ilike, or, desc } from "drizzle-orm";
import type { CatalogFormData } from "@/app/(project)/ichiba/lib/schemas";
import { db_conn1 } from "../../drizzle/db";
import { catalogs } from "../../drizzle/schema";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const query = searchParams.get("query");

    if (id) {
      // Get single catalog
      const [catalog] = await db_conn1.select().from(catalogs).where(eq(catalogs.id, id)).limit(1);

      if (!catalog) {
        return NextResponse.json({ error: "Catalog not found" }, { status: 404 });
      }

      return NextResponse.json(catalog);
    }

    if (query) {
      // Search catalogs
      const results = await db_conn1
        .select()
        .from(catalogs)
        .where(or(ilike(catalogs.title, `%${query}%`), ilike(catalogs.category, `%${query}%`)))
        .limit(10);

      return NextResponse.json(results);
    }

    // Get all catalogs
    const allCatalogs = await db_conn1.select().from(catalogs).orderBy(desc(catalogs.createdAt));

    return NextResponse.json(allCatalogs);
  } catch (error) {
    console.error("Error fetching catalogs:", error);
    return NextResponse.json({ error: "Failed to fetch catalogs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const catalogData: CatalogFormData = await request.json();
    const userId = request.headers.get("x-user-id"); // Get user ID from headers

    // Insert catalog
    const [newCatalog] = await db_conn1
      .insert(catalogs)
      .values({
        ...catalogData,
        category: catalogData.category || "",
      })
      .returning();

    // Log activity (you'd call your activity service here)
    if (userId) {
      // Make API call to log activity
      await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          action: "CREATE",
          entity_type: "catalogs",
          entity_id: newCatalog.title,
          details: {
            catalog: newCatalog,
          },
        }),
      });
    }

    return NextResponse.json(newCatalog, { status: 201 });
  } catch (error) {
    console.error("Error creating catalog:", error);
    return NextResponse.json({ error: "Failed to create catalog" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...catalogData } = await request.json();
    const userId = request.headers.get("x-user-id");

    const [updatedCatalog] = await db_conn1
      .update(catalogs)
      .set({
        ...catalogData,
        updatedAt: new Date(),
      })
      .where(eq(catalogs.id, id))
      .returning();

    if (!updatedCatalog) {
      return NextResponse.json({ error: "Catalog not found" }, { status: 404 });
    }

    // Log activity
    if (userId) {
      await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          action: "UPDATE",
          entity_type: "catalogs",
          entity_id: updatedCatalog.title,
          details: {
            catalog: updatedCatalog,
          },
        }),
      });
    }

    return NextResponse.json(updatedCatalog);
  } catch (error) {
    console.error("Error updating catalog:", error);
    return NextResponse.json({ error: "Failed to update catalog" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const userId = request.headers.get("x-user-id");

    // Get catalog info before deletion for activity log
    const [catalog] = await db_conn1.select().from(catalogs).where(eq(catalogs.id, id)).limit(1);

    if (!catalog) {
      return NextResponse.json({ error: "Catalog not found" }, { status: 404 });
    }

    await db_conn1.delete(catalogs).where(eq(catalogs.id, id));

    // Log activity
    if (userId) {
      await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          action: "DELETE",
          entity_type: "catalogs",
          entity_id: catalog.title,
          details: {
            catalogId: id,
          },
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting catalog:", error);
    return NextResponse.json({ error: "Failed to delete catalog" }, { status: 500 });
  }
}

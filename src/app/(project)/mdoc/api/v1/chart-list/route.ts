import { NextResponse } from "next/server";

import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wid = searchParams.get("wid");

    if (!wid) {
      return NextResponse.json({ error: "Missing wid parameter" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "chart-for-doc");

    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json([]);
    }

    // Get all files matching the wid prefix
    const files = fs.readdirSync(uploadDir);
    const widFiles = files
      .filter((file) => file.startsWith(`${wid}-`) && (file.endsWith(".jpg") || file.endsWith(".png")))
      .map((file) => ({
        filename: file,
        path: `/chart-for-doc/${file}`,
      }));

    return NextResponse.json(widFiles);
  } catch (error) {
    console.error("Error listing charts:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list charts" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";

import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageData, filename } = body;

    if (!imageData || !filename) {
      return NextResponse.json({ error: "Missing imageData or filename" }, { status: 400 });
    }

    // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");

    // Create the directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "chart-for-doc");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write the file
    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(base64Data, "base64");
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, path: `/chart-for-doc/${filename}` });
  } catch (error) {
    console.error("Error saving chart:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save chart" },
      { status: 500 },
    );
  }
}

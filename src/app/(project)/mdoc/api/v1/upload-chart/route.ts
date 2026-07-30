import { NextResponse } from "next/server";

import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileName = formData.get("fileName") as string | null;

    if (!file || !fileName) {
      return NextResponse.json({ error: "Missing file or filename" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/chart-for-doc directory
    const uploadDir = path.join(process.cwd(), "public", "chart-for-doc");
    const filePath = path.join(uploadDir, `${fileName}.jpg`);

    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, path: `/chart-for-doc/${fileName}.jpg` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

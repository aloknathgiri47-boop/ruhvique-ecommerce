import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// POST — handle image upload (multipart form-data with field "file")
// Saves to /public/uploads and returns the public URL.
export async function POST(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const files = formData.getAll("files").filter(Boolean) as File[];
    if (files.length === 0) {
      // Try single file
      const single = formData.get("file") as File | null;
      if (single) files.push(single);
    }
    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];
    for (const file of files) {
      if (!file.size) continue;
      const ext = path.extname(file.name || ".jpg").toLowerCase() || ".jpg";
      const filename = `${randomUUID()}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), buffer);
      urls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ urls });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Upload failed" },
      { status: 500 }
    );
  }
}

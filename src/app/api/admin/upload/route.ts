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

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    const urls: string[] = [];
    for (const file of files) {
      if (!file.size) continue;
      // Server-side size validation
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" is too large. Max size is 5 MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB` },
          { status: 400 }
        );
      }
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

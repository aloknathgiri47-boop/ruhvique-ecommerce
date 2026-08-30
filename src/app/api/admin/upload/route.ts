import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin-auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST — handle image upload to Cloudinary
export async function POST(req: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const files = formData.getAll("files").filter(Boolean) as File[];
    if (files.length === 0) {
      const single = formData.get("file") as File | null;
      if (single) files.push(single);
    }
    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

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

      // Convert file to base64
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(base64Data, {
        folder: "ruhvique",
        resource_type: "image",
        transformation: [
          { width: 1200, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      });

      urls.push(result.secure_url);
    }

    return NextResponse.json({ urls });
  } catch (e: any) {
    console.error("[upload] error", e);
    return NextResponse.json(
      { error: e?.message || "Upload failed" },
      { status: 500 }
    );
  }
}

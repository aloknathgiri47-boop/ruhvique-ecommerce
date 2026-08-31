import { NextResponse } from "next/server";
import { checkPincodeServiceability } from "@/lib/delhivery";

// GET /api/pincode/[code] — check if pincode is serviceable
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!code) {
    return NextResponse.json({ error: "Pincode required" }, { status: 400 });
  }

  const result = await checkPincodeServiceability(code);
  return NextResponse.json(result);
}

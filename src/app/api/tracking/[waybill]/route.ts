import { NextResponse } from "next/server";
import { trackShipment } from "@/lib/delhivery";

// GET /api/tracking/[waybill] — track a Delhivery shipment
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ waybill: string }> }
) {
  const { waybill } = await params;

  if (!waybill) {
    return NextResponse.json({ error: "Waybill number required" }, { status: 400 });
  }

  const result = await trackShipment(waybill);
  return NextResponse.json(result);
}

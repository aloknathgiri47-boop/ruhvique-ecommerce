import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const Schema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
});

// PATCH /api/account/profile — update profile (name, phone)
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
      },
      select: { id: true, name: true, email: true, phone: true },
    });
    return NextResponse.json({ user: updated });
  } catch (e: any) {
    console.error("[profile] error", e);
    return NextResponse.json(
      { error: "Failed to update profile", detail: e?.message },
      { status: 500 }
    );
  }
}

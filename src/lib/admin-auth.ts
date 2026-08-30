import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

// Returns the admin user if the current session belongs to an admin, else null.
export async function getAdminSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  if (!(session.user as any).isAdmin) return null;
  return session;
}

// Throws a 401 response helper
export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function requireAdminUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) return null;
  // Verify admin exists in DB
  const admin = await db.admin.findUnique({
    where: { email: (session.user as any).email },
  });
  return admin;
}

export function isSuperAdmin(session: Session | null): boolean {
  return (session?.user as any)?.role === "SUPER_ADMIN";
}

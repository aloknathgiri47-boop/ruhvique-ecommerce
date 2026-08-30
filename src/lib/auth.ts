import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";

export async function getSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user) return null;
  return session.user as any;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?callbackUrl=" + encodeURIComponent(typeof window === "undefined" ? "" : window.location.href));
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) redirect("/admin/login");
  return user;
}

export async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") redirect("/admin");
  return user;
}

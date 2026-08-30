import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: "Admin · RUHVIQUE",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  // If no session at all → admin login
  if (!session?.user || !(session.user as any).isAdmin) {
    redirect("/admin/login");
  }
  return <AdminShell user={JSON.parse(JSON.stringify(session.user))}>{children}</AdminShell>;
}

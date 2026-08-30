// Minimal admin layout — applies to all /admin/* routes including /admin/login.
// Auth protection lives in /(protected)/layout.tsx so /admin/login is accessible.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

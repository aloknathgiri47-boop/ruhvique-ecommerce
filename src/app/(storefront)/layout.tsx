import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
}

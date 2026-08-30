import { db } from "@/lib/db";
import { BannersClient } from "@/components/admin/banners-client";
import { bannerImage } from "@/lib/placeholder";

export default async function AdminBannersPage() {
  const banners = await db.banner.findMany({ orderBy: { displayOrder: "asc" } });
  // If no banners, suggest default placeholder for new ones
  return <BannersClient banners={JSON.parse(JSON.stringify(banners))} sampleImage={bannerImage("New Banner", "Subtitle", 1600, 700)} />;
}

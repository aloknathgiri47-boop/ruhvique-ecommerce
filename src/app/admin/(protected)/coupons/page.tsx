import { db } from "@/lib/db";
import { CouponsClient } from "@/components/admin/coupons-client";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return <CouponsClient coupons={JSON.parse(JSON.stringify(coupons))} />;
}

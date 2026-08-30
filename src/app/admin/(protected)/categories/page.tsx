import { db } from "@/lib/db";
import { CategoriesClient } from "@/components/admin/categories-client";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return <CategoriesClient categories={JSON.parse(JSON.stringify(categories))} />;
}

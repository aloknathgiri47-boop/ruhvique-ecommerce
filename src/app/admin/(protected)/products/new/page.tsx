import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  return <ProductForm product={null} categories={JSON.parse(JSON.stringify(categories))} />;
}

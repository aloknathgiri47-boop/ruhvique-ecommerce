import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
    },
  });
  if (!product) notFound();
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return <ProductForm product={JSON.parse(JSON.stringify(product))} categories={JSON.parse(JSON.stringify(categories))} />;
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Plus, Search, Trash2, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  discountPrice: number | null;
  active: boolean;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  trending: boolean;
  categoryName: string;
  totalStock: number;
  image: string;
  createdAt: string;
}

export function ProductsTableClient({
  products,
  categories,
}: {
  products: ProductItem[];
  categories: Array<{ id: string; name: string; slug: string }>;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");
  const [category, setCategory] = useState(sp.get("category") || "all");
  const [active, setActive] = useState(sp.get("active") || "all");

  const applyFilters = (qVal: string, cat: string, act: string) => {
    const params = new URLSearchParams();
    if (qVal) params.set("q", qVal);
    if (cat !== "all") params.set("category", cat);
    if (act !== "all") params.set("active", act);
    router.push(`/admin/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Mark this product as inactive?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Product deactivated");
      router.refresh();
    } else {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} products</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters(q, category, active)}
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v); applyFilters(q, v, active); }}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={active} onValueChange={(v) => { setActive(v); applyFilters(q, category, v); }}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto ru-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">SKU</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">Stock</th>
                <th className="py-3 px-4 font-medium">Flags</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        { }
                        <img src={p.image} alt={p.name} className="h-12 w-10 object-cover rounded bg-muted" />
                        <div className="min-w-0">
                          <p className="font-medium line-clamp-1">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{p.sku}</td>
                    <td className="py-3 px-4">{p.categoryName}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{formatCurrency(p.discountPrice ?? p.price)}</p>
                      {p.discountPrice && (
                        <p className="text-xs text-muted-foreground line-through">{formatCurrency(p.price)}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={p.totalStock === 0 ? "text-red-600 font-medium" : p.totalStock <= 10 ? "text-amber-600 font-medium" : ""}>
                        {p.totalStock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.featured && <Badge variant="outline" className="text-[10px]">Featured</Badge>}
                        {p.bestseller && <Badge variant="outline" className="text-[10px]">Best</Badge>}
                        {p.newArrival && <Badge variant="outline" className="text-[10px]">New</Badge>}
                        {p.trending && <Badge variant="outline" className="text-[10px]">Trending</Badge>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={p.active ? "default" : "secondary"}>
                        {p.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/product/${p.slug}`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/admin/products/${p.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

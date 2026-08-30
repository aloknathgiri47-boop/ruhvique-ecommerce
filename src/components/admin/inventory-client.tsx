"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle, AlertCircle, Save } from "lucide-react";
import { toast } from "sonner";

interface Variant {
  id: string;
  size: string;
  color: string;
  colorHex: string | null;
  stock: number;
}

interface Item {
  id: string;
  name: string;
  sku: string;
  categoryName: string;
  totalStock: number;
  variants: Variant[];
  lowStock: boolean;
  outOfStock: boolean;
}

export function InventoryClient({
  items,
  initialQuery,
  lowStockOnly,
}: {
  items: Item[];
  initialQuery: string;
  lowStockOnly: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const handleSave = async (variantId: string) => {
    if (stockEdits[variantId] === undefined) return;
    setSaving(variantId);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, stock: stockEdits[variantId] }),
      });
      if (res.ok) {
        toast.success("Stock updated");
        setStockEdits((prev) => {
          const next = { ...prev };
          delete next[variantId];
          return next;
        });
        router.refresh();
      } else {
        toast.error("Update failed");
      }
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} products · {items.filter((i) => i.lowStock).length} low stock · {items.filter((i) => i.outOfStock).length} out of stock
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/admin/inventory?q=${encodeURIComponent(q)}`)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            variant={lowStockOnly ? "default" : "outline"}
            onClick={() => router.push(lowStockOnly ? "/admin/inventory" : "/admin/inventory?lowStock=true")}
          >
            <AlertTriangle className="h-4 w-4 mr-2" /> Low Stock Only
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto ru-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">Variant</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Stock</th>
                <th className="py-3 px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              ) : (
                items.flatMap((p) =>
                  p.variants.length === 0 ? (
                    <tr key={p.id} className="border-t">
                      <td className="py-3 px-4 font-medium">{p.name}</td>
                      <td className="py-3 px-4 text-muted-foreground" colSpan={2}>No variants configured</td>
                      <td className="py-3 px-4">—</td>
                      <td className="py-3 px-4">—</td>
                    </tr>
                  ) : (
                    p.variants.map((v, idx) => {
                      const edited = stockEdits[v.id];
                      const currentStock = edited !== undefined ? edited : v.stock;
                      const isLow = v.stock > 0 && v.stock <= 5;
                      const isOut = v.stock === 0;
                      return (
                        <tr key={v.id} className="border-t hover:bg-muted/30">
                          {idx === 0 && (
                            <td className="py-3 px-4 font-medium align-top" rowSpan={p.variants.length}>
                              {p.name}
                              <p className="text-xs text-muted-foreground font-normal">{p.sku} · {p.categoryName}</p>
                              <p className="text-xs text-muted-foreground font-normal mt-1">Total: {p.totalStock} units</p>
                            </td>
                          )}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-5 w-5 rounded-full border" style={{ background: v.colorHex || "#ccc" }} />
                              <span className="font-medium">{v.size}</span>
                              <span className="text-muted-foreground">· {v.color}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {isOut ? (
                              <Badge variant="destructive">Out of stock</Badge>
                            ) : isLow ? (
                              <Badge className="bg-amber-100 text-amber-800">Low stock</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700">In stock</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={currentStock}
                              onChange={(e) => setStockEdits((prev) => ({ ...prev, [v.id]: Number(e.target.value) }))}
                              className="h-8 w-20"
                              min={0}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={edited === undefined || saving === v.id}
                              onClick={() => handleSave(v.id)}
                              className="h-8"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              {saving === v.id ? "..." : "Save"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const SIZES = ["S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Black", hex: "#0a0a0a" },
  { name: "White", hex: "#ffffff" },
  { name: "Grey", hex: "#9ca3af" },
  { name: "Navy", hex: "#1e293b" },
];

export function FilterPanel({ category }: { category?: string }) {
  const router = useRouter();
  const sp = useSearchParams();

  const toggleParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(sp.toString());
      const existing = params.get(key)?.split(",").filter(Boolean) ?? [];
      const idx = existing.indexOf(value);
      if (idx >= 0) existing.splice(idx, 1);
      else existing.push(value);
      if (existing.length) params.set(key, existing.join(","));
      else params.delete(key);
      params.delete("page");
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, sp]
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(sp.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, sp]
  );

  const selectedSizes = sp.get("sizes")?.split(",").filter(Boolean) ?? [];
  const selectedColors = sp.get("colors")?.split(",").filter(Boolean) ?? [];
  const minPrice = sp.get("minPrice") ? Number(sp.get("minPrice")) : 0;
  const maxPrice = sp.get("maxPrice") ? Number(sp.get("maxPrice")) : 5000;
  const inStockOnly = sp.get("availability") === "in-stock";
  const sort = sp.get("sort") || "newest";

  const Panel = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Sort</h3>
        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Popular</option>
          <option value="rating">Best Rated</option>
        </select>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleParam("sizes", s)}
              className={cn(
                "h-10 min-w-10 rounded-md border px-3 text-sm font-medium transition-colors",
                selectedSizes.includes(s)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Color</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => toggleParam("colors", c.name)}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors",
                selectedColors.includes(c.name)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground"
              )}
            >
              <span
                className="h-4 w-4 rounded-full border border-black/10"
                style={{ background: c.hex }}
              />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">
          Price: ₹{minPrice} – ₹{maxPrice}
        </h3>
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={5000}
            step={100}
            value={maxPrice}
            onChange={(e) => setParam("maxPrice", e.target.value)}
            className="w-full accent-primary"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice || ""}
              onChange={(e) => setParam("minPrice", e.target.value || null)}
              className="w-1/2 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice === 5000 ? "" : maxPrice}
              onChange={(e) => setParam("maxPrice", e.target.value || null)}
              className="w-1/2 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">Availability</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setParam("availability", e.target.checked ? "in-stock" : null)}
            className="h-4 w-4 accent-primary"
          />
          In stock only
        </label>
      </div>

      <button
        type="button"
        onClick={() => router.push(category ? `/${category}` : "/search", { scroll: false })}
        className="w-full rounded-md border border-border py-2 text-sm font-medium hover:bg-accent"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-20">{Panel}</div>
      </aside>

      {/* Mobile sheet trigger */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[360px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">{Panel}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

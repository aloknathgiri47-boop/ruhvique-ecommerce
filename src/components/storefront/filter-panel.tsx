"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal, X, Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Black", hex: "#0a0a0a" },
  { name: "White", hex: "#ffffff" },
  { name: "Grey", hex: "#9ca3af" },
  { name: "Navy", hex: "#1e293b" },
  { name: "Olive", hex: "#3d4a2a" },
  { name: "Cream", hex: "#f5e6d3" },
  { name: "Maroon", hex: "#5c1f1f" },
  { name: "Khaki", hex: "#a98467" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Popular" },
  { value: "rating", label: "Best Rated" },
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

  const activeFilterCount =
    selectedSizes.length + selectedColors.length + (inStockOnly ? 1 : 0) +
    (minPrice > 0 ? 1 : 0) + (maxPrice !== 5000 && maxPrice > 0 ? 1 : 0);

  const Panel = (
    <div className="space-y-6">
      {/* Active filters badge */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between rounded-md bg-primary/5 px-3 py-2">
          <span className="text-xs font-semibold">
            {activeFilterCount} active {activeFilterCount === 1 ? "filter" : "filters"}
          </span>
          <button
            onClick={() => router.push(category ? `/${category}` : "/search", { scroll: false })}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Sort */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort By</h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setParam("sort", opt.value)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                sort === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              {opt.label}
              {sort === opt.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Size</h3>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleParam("sizes", s)}
              className={cn(
                "h-10 rounded-md border-2 text-sm font-bold transition-all",
                selectedSizes.includes(s)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground/40"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Color</h3>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => toggleParam("colors", c.name)}
              title={c.name}
              className={cn(
                "flex items-center gap-2 rounded-full border-2 py-1.5 pl-1.5 pr-3 text-xs font-medium transition-all",
                selectedColors.includes(c.name)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-foreground/40"
              )}
            >
              <span
                className="h-6 w-6 rounded-full border border-black/10 flex-shrink-0"
                style={{ background: c.hex }}
              />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Price Range
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-medium">
            <span>₹{minPrice || 0}</span>
            <span>₹{maxPrice || 5000}</span>
          </div>
          <input
            type="range"
            min={0}
            max={5000}
            step={100}
            value={maxPrice}
            onChange={(e) => setParam("maxPrice", e.target.value)}
            className="w-full accent-primary cursor-pointer"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min ₹"
              value={minPrice || ""}
              onChange={(e) => setParam("minPrice", e.target.value || null)}
              className="w-1/2 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={maxPrice === 5000 ? "" : maxPrice}
              onChange={(e) => setParam("maxPrice", e.target.value || null)}
              className="w-1/2 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Availability</h3>
        <button
          type="button"
          onClick={() => setParam("availability", !inStockOnly ? "in-stock" : null)}
          className={cn(
            "flex w-full items-center justify-between rounded-md border-2 px-3 py-2.5 text-sm font-medium transition-all",
            inStockOnly
              ? "border-primary bg-primary/5"
              : "border-border hover:border-foreground/40"
          )}
        >
          <span>In stock only</span>
          <div className={cn(
            "flex h-5 w-5 items-center justify-center rounded border-2 transition-all",
            inStockOnly ? "border-primary bg-primary text-primary-foreground" : "border-border"
          )}>
            {inStockOnly && <Check className="h-3 w-3" />}
          </div>
        </button>
      </div>

      {/* Clear all */}
      <button
        type="button"
        onClick={() => router.push(category ? `/${category}` : "/search", { scroll: false })}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-border py-2.5 text-sm font-medium hover:bg-accent transition-colors"
      >
        <X className="h-4 w-4" /> Clear all filters
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-20 rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </div>
          {Panel}
        </div>
      </aside>

      {/* Mobile sheet trigger */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[360px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">{Panel}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

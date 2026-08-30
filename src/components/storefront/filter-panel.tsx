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

const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 - ₹1,500", min: 1000, max: 1500 },
  { label: "₹1,500 - ₹2,000", min: 1500, max: 2000 },
  { label: "₹2,000 - ₹3,000", min: 2000, max: 3000 },
  { label: "₹3,000+", min: 3000, max: 5000 },
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

  const setPriceRange = useCallback(
    (min: number, max: number) => {
      const params = new URLSearchParams(sp.toString());
      const currentMin = params.get("minPrice");
      const currentMax = params.get("maxPrice");
      // Toggle off if same range clicked
      if (currentMin === String(min) && currentMax === String(max)) {
        params.delete("minPrice");
        params.delete("maxPrice");
      } else {
        params.set("minPrice", String(min));
        params.set("maxPrice", String(max));
      }
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
    (sp.get("minPrice") ? 1 : 0);

  const isPriceRangeActive = (min: number, max: number) => {
    return minPrice === min && maxPrice === max;
  };

  const clearAll = () => router.push(category ? `/${category}` : "/search", { scroll: false });

  const Panel = (
    <div className="space-y-5">
      {/* Active filters badge */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between rounded-md bg-primary/5 px-3 py-2">
          <span className="text-xs font-semibold">
            {activeFilterCount} active {activeFilterCount === 1 ? "filter" : "filters"}
          </span>
          <button
            onClick={clearAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Sort */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort By</h3>
        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-medium cursor-pointer hover:border-foreground/40 transition-colors"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Size */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Size</h3>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleParam("sizes", s)}
              className={cn(
                "h-9 min-w-9 px-2.5 rounded-md border-2 text-xs font-bold transition-all",
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
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Color</h3>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => toggleParam("colors", c.name)}
              title={c.name}
              className={cn(
                "h-8 w-8 rounded-full border-2 transition-all hover:scale-110",
                selectedColors.includes(c.name)
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              )}
              style={{ background: c.hex }}
            >
              {selectedColors.includes(c.name) && (
                <Check className={cn("h-4 w-4 mx-auto", c.name === "White" || c.name === "Cream" ? "text-black" : "text-white")} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price - preset ranges (no scroll needed) */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Price Range</h3>
        <div className="space-y-1">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.label}
              type="button"
              onClick={() => setPriceRange(range.min, range.max)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                isPriceRangeActive(range.min, range.max)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              {range.label}
              {isPriceRangeActive(range.min, range.max) && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Availability</h3>
        <button
          type="button"
          onClick={() => setParam("availability", !inStockOnly ? "in-stock" : null)}
          className={cn(
            "flex w-full items-center justify-between rounded-md border-2 px-3 py-2 text-xs font-medium transition-all",
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
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-border py-2 text-xs font-medium hover:bg-accent transition-colors"
        >
          <X className="h-3.5 w-3.5" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar - compact, no scroll needed */}
      <aside className="hidden lg:block w-60 flex-shrink-0">
        <div className="sticky top-20 rounded-lg border border-border bg-card p-4 max-h-[calc(100vh-6rem)] overflow-y-auto ru-scrollbar">
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

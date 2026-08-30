"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import {
  SlidersHorizontal,
  X,
  Check,
  ChevronDown,
  ArrowUpDown,
  Shirt,
  Palette,
  IndianRupee,
  PackageCheck,
  Sparkles,
  Truck,
  RotateCcw,
  Shield,
  Tag,
  Headphones,
} from "lucide-react";
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
  { value: "newest", label: "Newest", icon: Sparkles },
  { value: "price_asc", label: "Price: Low to High", icon: ArrowUpDown },
  { value: "price_desc", label: "Price: High to Low", icon: ArrowUpDown },
  { value: "popular", label: "Popular", icon: Sparkles },
  { value: "rating", label: "Best Rated", icon: Sparkles },
];

const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 - ₹1,500", min: 1000, max: 1500 },
  { label: "₹1,500 - ₹2,000", min: 1500, max: 2000 },
  { label: "₹2,000 - ₹3,000", min: 2000, max: 3000 },
  { label: "₹3,000+", min: 3000, max: 5000 },
];

function SectionHeader({
  icon: Icon,
  title,
  section,
  count,
  expandedSection,
  onToggle,
}: {
  icon: any;
  title: string;
  section: string;
  count?: number;
  expandedSection: string | null;
  onToggle: (section: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(section)}
      className="flex w-full items-center gap-2 py-1"
    >
      <div className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-foreground">{title}</span>
      {count && count > 0 ? (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
          {count}
        </span>
      ) : null}
      <ChevronDown
        className={cn(
          "ml-auto h-4 w-4 text-muted-foreground transition-transform",
          expandedSection === section && "rotate-180"
        )}
      />
    </button>
  );
}

export function FilterPanel({ category }: { category?: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [expandedSection, setExpandedSection] = useState<string | null>("sort");

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

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const Panel = (
    <div className="space-y-3">
      {/* Active filters bar */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 px-3 py-2.5 border border-primary/20">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {activeFilterCount}
            </div>
            <span className="text-xs font-semibold">
              {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"} active
            </span>
          </div>
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        </div>
      )}

      {/* Sort Section */}
      <div className="rounded-lg border border-border p-2.5 bg-card">
        <SectionHeader icon={ArrowUpDown} title="Sort By" section="sort" expandedSection={expandedSection} onToggle={toggleSection} />
        {expandedSection === "sort" && (
          <div className="mt-3 space-y-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setParam("sort", opt.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-all",
                  sort === opt.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-accent text-foreground/80"
                )}
              >
                <span className="flex items-center gap-2">
                  <opt.icon className="h-3.5 w-3.5" />
                  {opt.label}
                </span>
                {sort === opt.value && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Size Section */}
      <div className="rounded-lg border border-border p-2.5 bg-card">
        <SectionHeader icon={Shirt} title="Size" section="size" count={selectedSizes.length} expandedSection={expandedSection} onToggle={toggleSection} />
        {expandedSection === "size" && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleParam("sizes", s)}
                className={cn(
                  "h-10 rounded-md border-2 text-xs font-bold transition-all",
                  selectedSizes.includes(s)
                    ? "border-primary bg-primary text-primary-foreground shadow-sm scale-105"
                    : "border-border hover:border-foreground/40 hover:bg-accent/50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color Section */}
      <div className="rounded-lg border border-border p-2.5 bg-card">
        <SectionHeader icon={Palette} title="Color" section="color" count={selectedColors.length} expandedSection={expandedSection} onToggle={toggleSection} />
        {expandedSection === "color" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => toggleParam("colors", c.name)}
                title={c.name}
                className={cn(
                  "group relative h-10 w-10 rounded-full border-2 transition-all hover:scale-110",
                  selectedColors.includes(c.name)
                    ? "border-primary ring-2 ring-primary/20 scale-110"
                    : "border-border"
                )}
                style={{ background: c.hex }}
              >
                {selectedColors.includes(c.name) && (
                  <Check className={cn(
                    "h-5 w-5 absolute inset-0 m-auto",
                    c.name === "White" || c.name === "Cream" ? "text-black" : "text-white"
                  )} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Section */}
      <div className="rounded-lg border border-border p-2.5 bg-card">
        <SectionHeader icon={IndianRupee} title="Price Range" section="price" count={sp.get("minPrice") ? 1 : 0} expandedSection={expandedSection} onToggle={toggleSection} />
        {expandedSection === "price" && (
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {PRICE_RANGES.map((range) => (
              <button
                key={range.label}
                type="button"
                onClick={() => setPriceRange(range.min, range.max)}
                className={cn(
                  "rounded-md px-2.5 py-2 text-[11px] font-semibold transition-all",
                  isPriceRangeActive(range.min, range.max)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-accent/50 hover:bg-accent text-foreground/80"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Availability Section */}
      <div className="rounded-lg border border-border p-2.5 bg-card">
        <SectionHeader icon={PackageCheck} title="Availability" section="availability" count={inStockOnly ? 1 : 0} expandedSection={expandedSection} onToggle={toggleSection} />
        {expandedSection === "availability" && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setParam("availability", !inStockOnly ? "in-stock" : null)}
              className={cn(
                "flex w-full items-center justify-between rounded-md border-2 px-3 py-2.5 text-xs font-semibold transition-all",
                inStockOnly
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-foreground/40"
              )}
            >
              <span className="flex items-center gap-2">
                <PackageCheck className={cn("h-4 w-4", inStockOnly ? "text-primary" : "text-muted-foreground")} />
                In stock only
              </span>
              <div className={cn(
                "flex h-5 w-5 items-center justify-center rounded border-2 transition-all",
                inStockOnly ? "border-primary bg-primary text-primary-foreground" : "border-border"
              )}>
                {inStockOnly && <Check className="h-3 w-3" />}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Clear all button */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-2.5 text-xs font-bold uppercase tracking-wider hover:border-primary hover:text-primary transition-all"
        >
          <X className="h-3.5 w-3.5" /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar - 280px fixed, does NOT scroll */}
      <aside className="hidden lg:block w-[340px] flex-shrink-0">
        <div className="sticky top-20 h-[calc(100vh-6rem)] flex flex-col gap-3">
          {/* Filters panel — no internal scroll, all content visible */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex-1 overflow-y-auto ru-scrollbar">
            {/* Header */}
            <div className="mb-4 flex items-center gap-2 pb-3 border-b">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider">Filters</h2>
              {activeFilterCount > 0 && (
                <span className="ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {Panel}
          </div>

          {/* Promo banner — fixed at bottom */}
          <div className="rounded-xl bg-primary text-primary-foreground p-4 text-center flex-shrink-0">
            <Tag className="h-6 w-6 mx-auto mb-2" />
            <p className="text-xs font-black uppercase tracking-wider mb-1">Use Code</p>
            <p className="text-lg font-black tracking-wider mb-2">RUHVIQUE10</p>
            <p className="text-[10px] text-primary-foreground/70">Get 10% off your first order</p>
          </div>

          {/* Quick help card — fixed at bottom */}
          <div className="rounded-xl border border-border bg-card p-4 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Headphones className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Need Help?</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="h-3.5 w-3.5" />
                <span>Free shipping over ₹1,999</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>7-day easy returns</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                <span>100% secure payment</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sheet trigger */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-card px-4 py-2.5 text-sm font-bold hover:border-primary hover:bg-accent transition-all shadow-sm">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px] sm:w-[380px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <span className="text-base font-black uppercase tracking-wider">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">{Panel}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchBox({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(initialQuery);

  useEffect(() => {
    setQ(initialQuery);
  }, [initialQuery]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim()) {
        router.replace(`/search?q=${encodeURIComponent(q.trim())}`, { scroll: false });
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="relative max-w-2xl">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
        placeholder="Search for products, categories, or SKU..."
        className="w-full h-12 rounded-full border border-border bg-background pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {q && (
        <button
          onClick={() => {
            setQ("");
            router.push("/search");
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

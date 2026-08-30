"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  image: string;
  ctaText?: string | null;
  ctaLink?: string | null;
}

export function HeroBanner({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(next, 2000);
    return () => clearInterval(t);
  }, [paused, count, next]);

  if (count === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-primary"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((b) => (
          <div key={b.id} className="relative w-full flex-shrink-0">
            <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/5] w-full">
              { }
              <img
                src={b.image}
                alt={b.title}
                className="absolute inset-0 h-full w-full object-cover"
                data-priority={index === 0 ? "true" : "false"}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              {/* Only show text overlay if there's a title, subtitle, or CTA */}
              {(b.title?.trim() || b.subtitle?.trim() || (b.ctaText && b.ctaLink)) && (
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto max-w-7xl px-6 sm:px-10">
                    <div className="max-w-xl">
                      {b.title?.trim() && (
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
                          {b.title}
                        </h1>
                      )}
                      {b.subtitle?.trim() && (
                        <p className="mt-3 text-sm sm:text-base lg:text-lg text-white/80 max-w-md">
                          {b.subtitle}
                        </p>
                      )}
                      {b.ctaText && b.ctaLink && (
                        <Link
                          href={b.ctaLink}
                          className="inline-flex items-center gap-2 mt-6 bg-white text-black px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
                        >
                          {b.ctaText}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous banner"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25 text-white transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next banner"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25 text-white transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "bg-white w-6" : "bg-white/50 w-2 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}

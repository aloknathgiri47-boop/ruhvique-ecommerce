"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, User, ShoppingBag, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/store";
import { useSession } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "T-Shirts", href: "/tshirts" },
  { label: "Apparel", href: "/apparel" },
  { label: "Hoodies", href: "/hoodies" },
  { label: "Gym Wear", href: "/gym-wear" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const count = useCart((s) => s.count());
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-shadow border-b",
        scrolled ? "shadow-sm border-border" : "border-transparent"
      )}
      style={{ minHeight: "64px" }}
    >
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label="Open menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[360px]">
                <SheetHeader>
                  <SheetTitle className="text-left flex items-center gap-2.5">
                    <div className="ru-logo-shine ru-logo-ring ru-logo-shadow ru-logo-hover rounded-md overflow-hidden">
                      <img
                        src="/ruhvique-logo.jpeg"
                        alt="RUHVIQUE"
                        className="h-14 w-14 rounded-md object-cover"
                      />
                    </div>
                    <span className="text-xl font-black tracking-[0.2em]">RUHVIQUE</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-1">
                  {NAV_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={cn(
                        "rounded-md px-3 py-3 text-base font-medium hover:bg-accent transition-colors",
                        pathname === l.href && "bg-accent"
                      )}
                    >
                      {l.label}
                    </Link>
                  ))}
                  <Link
                    href="/admin/login"
                    className={cn(
                      "mt-2 flex items-center gap-2 rounded-md border border-border px-3 py-3 text-sm font-semibold hover:bg-accent transition-colors",
                      pathname.startsWith("/admin") && "bg-accent border-foreground"
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                </nav>
                <div className="mt-8 border-t pt-4">
                  <Link
                    href="/account"
                    className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-accent"
                  >
                    <User className="h-5 w-5" /> My Account
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-accent"
                  >
                    Wishlist
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Center-Left: Logo */}
          <Link
            href="/"
            className="group flex items-center"
            aria-label="RUHVIQUE home"
          >
            <div className="ru-logo-shine ru-logo-ring ru-logo-shadow ru-logo-hover rounded-md overflow-hidden">
              <img
                src="/ruhvique-logo.jpeg"
                alt="RUHVIQUE"
                className="h-14 w-14 rounded-md object-cover flex-shrink-0"
              />
            </div>
            <span className="ml-2.5 text-xl sm:text-2xl font-black tracking-[0.2em] group-hover:tracking-[0.25em] transition-all">
              RUHVIQUE
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "ru-link-hover px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors",
                  pathname === l.href && "text-foreground font-semibold"
                )}
              >
                {l.label}
              </Link>
            ))}
            {/* Admin link - subtle, next to Contact */}
            <Link
              href="/admin/login"
              className={cn(
                "ml-2 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground/70 hover:text-foreground hover:border-foreground/40 transition-colors",
                pathname.startsWith("/admin") && "border-foreground text-foreground"
              )}
            >
              <Shield className="h-3.5 w-3.5" />
              Admin
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/search"
              aria-label="Search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent"
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              href={session ? "/account" : "/signin"}
              aria-label="Account"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent"
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Twitter, Facebook, Youtube } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Hide footer on category pages (tshirts, apparel, hoodies, gym-wear)
  const categorySlugs = ["/tshirts", "/apparel", "/hoodies", "/gym-wear"];
  if (categorySlugs.some((slug) => pathname.startsWith(slug))) {
    return null;
  }

  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <div className="ru-logo-shine ru-logo-ring ru-logo-glow-dark rounded-md overflow-hidden">
                <img
                  src="/ruhvique-logo-final.png"
                  alt="RUHVIQUE"
                  className="h-11 w-11 rounded-md object-contain"
                />
              </div>
              <span className="text-2xl font-black tracking-[0.2em] group-hover:tracking-[0.25em] transition-all">
                RUHVIQUE
              </span>
            </Link>
            <p className="mt-3 text-sm text-primary-foreground/70 max-w-xs">
              Premium modern fashion & streetwear designed for those who refuse to blend in.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="hover:opacity-80 transition-opacity">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Twitter" className="hover:opacity-80 transition-opacity">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Facebook" className="hover:opacity-80 transition-opacity">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="YouTube" className="hover:opacity-80 transition-opacity">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link href="/tshirts" className="hover:text-primary-foreground">T-Shirts</Link></li>
              <li><Link href="/apparel" className="hover:text-primary-foreground">Apparel</Link></li>
              <li><Link href="/hoodies" className="hover:text-primary-foreground">Hoodies</Link></li>
              <li><Link href="/gym-wear" className="hover:text-primary-foreground">Gym Wear</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link href="/about" className="hover:text-primary-foreground">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary-foreground">Contact</Link></li>
              <li><Link href="/search" className="hover:text-primary-foreground">Search</Link></li>
              <li><Link href="/account" className="hover:text-primary-foreground">My Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link href="/privacy-policy" className="hover:text-primary-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary-foreground">Terms & Conditions</Link></li>
              <li><Link href="/refund-policy" className="hover:text-primary-foreground">Refund / Return Policy</Link></li>
              <li><Link href="/contact" className="hover:text-primary-foreground">Customer Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-primary-foreground/60">
            © {new Date().getFullYear()} RUHVIQUE. All rights reserved.
          </p>
          <p className="text-xs text-primary-foreground/60">
            Crafted for those who wear their attitude.
          </p>
        </div>
      </div>
    </footer>
  );
}

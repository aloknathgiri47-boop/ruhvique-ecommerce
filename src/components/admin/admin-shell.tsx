"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  ShoppingCart,
  Users,
  Image as ImageIcon,
  TicketPercent,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Banners", href: "/admin/banners", icon: ImageIcon },
  { label: "Coupons", href: "/admin/coupons", icon: TicketPercent },
  { label: "Contact", href: "/admin/contact", icon: Mail },
];

interface AdminShellProps {
  user: { name?: string | null; email?: string | null; role?: string };
  children: React.ReactNode;
}

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0">
        <SidebarContent
          user={user}
          isActive={isActive}
          onSignOut={() => {
            signOut({ callbackUrl: "/admin/login" });
          }}
          onNavigate={() => {}}
        />
      </aside>

      {/* Sidebar — mobile (Sheet) */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 flex flex-col bg-sidebar text-sidebar-foreground">
            <button
              className="absolute right-3 top-3 text-sidebar-foreground/70 hover:text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              user={user}
              isActive={isActive}
              onSignOut={() => signOut({ callbackUrl: "/admin/login" })}
              onNavigate={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background border-b h-14 flex items-center px-4 gap-3">
          <button
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 text-sm text-muted-foreground truncate">
            Welcome, <span className="font-medium text-foreground">{user.name || "Admin"}</span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View Store <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center text-xs font-bold">
            {(user.name || "A").slice(0, 1).toUpperCase()}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  user,
  isActive,
  onSignOut,
  onNavigate,
}: {
  user: { name?: string | null; email?: string | null; role?: string };
  isActive: (h: string) => boolean;
  onSignOut: () => void;
  onNavigate: () => void;
}) {
  return (
    <>
      <div className="h-14 flex items-center px-5 border-b border-sidebar-border">
        <Link href="/admin" className="inline-flex items-center gap-2" onClick={onNavigate}>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-black text-sm">
            R
          </span>
          <span className="text-lg font-black tracking-[0.2em]">RUHVIQUE</span>
        </Link>
        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-sidebar-accent px-1.5 py-0.5 rounded">
          Admin
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto ru-scrollbar">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="px-3 py-2 text-xs text-sidebar-foreground/60 truncate">
          {user.email}
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );
}

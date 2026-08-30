"use client";

import { Truck, Shield, RotateCcw, Sparkles } from "lucide-react";

const MESSAGES = [
  { icon: Truck, text: "FREE shipping on orders over ₹1,999" },
  { icon: RotateCcw, text: "7-day easy returns" },
  { icon: Shield, text: "100% secure payments" },
  { icon: Sparkles, text: "New drops every week" },
  { icon: Truck, text: "FREE shipping on orders over ₹1,999" },
  { icon: RotateCcw, text: "7-day easy returns" },
  { icon: Shield, text: "100% secure payments" },
  { icon: Sparkles, text: "New drops every week" },
];

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground overflow-hidden border-b border-primary-foreground/10">
      <div className="flex ru-marquee whitespace-nowrap py-2">
        {MESSAGES.map((m, i) => (
          <div key={i} className="flex items-center gap-2 px-6 text-xs font-medium tracking-wide">
            <m.icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{m.text}</span>
            <span className="ml-6 text-primary-foreground/30">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}

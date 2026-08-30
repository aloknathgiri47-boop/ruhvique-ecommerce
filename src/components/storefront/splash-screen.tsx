"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const hide = () => {
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setVisible(false), 500);
      }, 600);
    };

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide);
      const fallback = setTimeout(hide, 2000);
      return () => {
        window.removeEventListener("load", hide);
        clearTimeout(fallback);
      };
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <div className="ru-splash-logo-enter">
          <img
            src="/ruhvique-logo-final.png"
            alt="RUHVIQUE"
            className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-contain"
          />
        </div>

        {/* RUHVIQUE text */}
        <div className="ru-splash-text-enter text-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-[0.25em]">
            RUHVIQUE
          </h1>
          <p className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Premium Style. Perfect You.
          </p>
        </div>

        {/* Loading dots */}
        <div className="ru-splash-dots-enter flex gap-1.5 mt-2">
          <span className="ru-splash-dot" style={{ animationDelay: "0s" }} />
          <span className="ru-splash-dot" style={{ animationDelay: "0.15s" }} />
          <span className="ru-splash-dot" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </div>
  );
}

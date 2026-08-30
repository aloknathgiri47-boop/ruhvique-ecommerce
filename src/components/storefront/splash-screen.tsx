"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Hide splash after page loads
    const handleLoad = () => {
      // Small delay so user sees the branding
      setTimeout(() => {
        setFadingOut(true);
        setTimeout(() => setVisible(false), 600);
      }, 800);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      // Fallback: hide after 2.5s regardless
      const fallback = setTimeout(handleLoad, 2500);
      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(fallback);
      };
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Logo icon with entrance animation */}
        <div className="ru-splash-logo-enter relative">
          <div className="ru-logo-shine ru-logo-ring ru-logo-shadow rounded-lg overflow-hidden">
            { }
            <img
              src="/ruhvique-logo-final.png"
              alt="RUHVIQUE"
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg object-contain"
            />
          </div>
        </div>

        {/* RUHVIQUE text */}
        <div className="ru-splash-text-enter text-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-[0.25em]">
            RUHVIQUE
          </h1>
          <p className="mt-1.5 text-[10px] sm:text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Premium Style. Perfect You.
          </p>
        </div>

        {/* Loading bar */}
        <div className="ru-splash-bar-enter mt-2 h-0.5 w-32 sm:w-40 bg-muted overflow-hidden rounded-full">
          <div className="ru-splash-progress h-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

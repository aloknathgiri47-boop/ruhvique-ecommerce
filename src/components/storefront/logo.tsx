import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon" | "stacked";
  className?: string;
  textClassName?: string;
  showTagline?: boolean;
  dark?: boolean;
}

/**
 * RUHVIQUE Logo Component — uses the official brand logo image with premium effects
 * - full: Logo image (with shine + ring + hover) + "RUHVIQUE" wordmark
 * - icon: Just the logo image (square, with effects)
 * - stacked: Logo image centered, optional tagline below
 * - dark: Use glow effect for dark backgrounds instead of shadow
 */
export function Logo({ variant = "full", className, textClassName, showTagline = false, dark = false }: LogoProps) {
  const LOGO_SRC = "/ruhvique-logo.jpeg";
  const effectClasses = dark
    ? "ru-logo-shine ru-logo-ring ru-logo-glow-dark ru-logo-hover"
    : "ru-logo-shine ru-logo-ring ru-logo-shadow ru-logo-hover";

  if (variant === "icon") {
    return (
      <div className={cn("ru-logo-shine ru-logo-ring ru-logo-hover rounded-md overflow-hidden", className)}>
        { }
        <img
          src={LOGO_SRC}
          alt="RUHVIQUE"
          className="h-12 w-12 rounded-md object-cover"
        />
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className={cn(effectClasses, "rounded-lg overflow-hidden ru-logo-enter")}>
          { }
          <img
            src={LOGO_SRC}
            alt="RUHVIQUE"
            className="h-20 w-20 rounded-lg object-cover"
          />
        </div>
        {showTagline && (
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Premium Style. Perfect You.
          </p>
        )}
      </div>
    );
  }

  // full (default) — logo image + wordmark
  return (
    <span className={cn("group inline-flex items-center gap-2.5", className)}>
      <div className={cn(effectClasses, "rounded-md overflow-hidden")}>
        { }
        <img
          src={LOGO_SRC}
          alt="RUHVIQUE"
          className="h-12 w-12 rounded-md object-cover flex-shrink-0"
        />
      </div>
      <span className={cn("text-2xl font-black tracking-[0.2em] group-hover:tracking-[0.25em] transition-all", textClassName)}>
        RUHVIQUE
      </span>
    </span>
  );
}

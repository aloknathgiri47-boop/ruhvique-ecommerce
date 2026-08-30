import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon" | "stacked";
  className?: string;
  textClassName?: string;
  showTagline?: boolean;
}

/**
 * RUHVIQUE Logo Component — uses the official brand logo image
 * - full: Logo image + "RUHVIQUE" wordmark (for light backgrounds)
 * - icon: Just the logo image (square, contains all branding)
 * - stacked: Logo image centered, optional tagline below
 */
export function Logo({ variant = "full", className, textClassName, showTagline = false }: LogoProps) {
  const LOGO_SRC = "/ruhvique-logo.jpeg";

  if (variant === "icon") {
    return (
       
      <img
        src={LOGO_SRC}
        alt="RUHVIQUE"
        className={cn("h-9 w-9 rounded-md object-cover", className)}
      />
    );
  }

  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        { }
        <img
          src={LOGO_SRC}
          alt="RUHVIQUE"
          className="h-16 w-16 rounded-lg object-cover"
        />
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
    <span className={cn("inline-flex items-center gap-2", className)}>
      { }
      <img
        src={LOGO_SRC}
        alt="RUHVIQUE"
        className="h-8 w-8 rounded-md object-cover flex-shrink-0"
      />
      <span className={cn("text-xl font-black tracking-[0.2em]", textClassName)}>
        RUHVIQUE
      </span>
    </span>
  );
}

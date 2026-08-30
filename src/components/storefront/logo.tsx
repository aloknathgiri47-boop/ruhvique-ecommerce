import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "monogram" | "stacked";
  className?: string;
  textClassName?: string;
  showTagline?: boolean;
}

/**
 * RUHVIQUE Logo Component
 * - full: Monogram icon + "RUHVIQUE" wordmark
 * - monogram: Just the "R" icon box
 * - stacked: Monogram on top, wordmark below
 */
export function Logo({ variant = "full", className, textClassName, showTagline = false }: LogoProps) {
  if (variant === "monogram") {
    return (
      <span
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-black text-lg",
          className
        )}
        aria-label="RUHVIQUE"
      >
        R
      </span>
    );
  }

  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xl">
          R
        </span>
        <div className="text-center">
          <p className={cn("text-xl font-black tracking-[0.2em]", textClassName)}>RUHVIQUE</p>
          {showTagline && (
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1">
              Premium Streetwear
            </p>
          )}
        </div>
      </div>
    );
  }

  // full (default)
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-black text-base flex-shrink-0">
        R
      </span>
      <span className={cn("text-xl font-black tracking-[0.2em]", textClassName)}>
        RUHVIQUE
      </span>
    </span>
  );
}

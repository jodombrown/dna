import * as React from "react";
import { cn } from "@/lib/utils";

const GAP = {
  s: "gap-2",
  m: "gap-4",
  l: "gap-6",
} as const;

// Desktop column count. Mobile is always 1 col unless cols=2, which stays
// 2-up at every width (e.g. quick facts).
const DESKTOP_COLS = {
  2: "grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
  5: "md:grid-cols-2 lg:grid-cols-5",
} as const;

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: keyof typeof DESKTOP_COLS;
  gap?: keyof typeof GAP;
  /**
   * 'feature': first child takes 2 of 3 columns at desktop, breaking the
   * uniform card-grid rhythm on purpose (anti-vibecode rule: use this at
   * least once per page). 'sidebar': main/aside split, ~65/35.
   */
  variant?: "default" | "feature" | "sidebar";
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ cols = 3, gap = "m", variant = "default", className, children, ...props }, ref) => {
    if (variant === "feature") {
      return (
        <div
          ref={ref}
          className={cn("grid grid-cols-1 md:grid-cols-3", GAP[gap], "[&>:first-child]:md:col-span-2", className)}
          {...props}
        >
          {children}
        </div>
      );
    }
    if (variant === "sidebar") {
      return (
        <div
          ref={ref}
          className={cn("grid grid-cols-1 md:grid-cols-3", GAP[gap], "[&>:first-child]:md:col-span-2", className)}
          {...props}
        >
          {children}
        </div>
      );
    }
    return (
      <div
        ref={ref}
        className={cn("grid grid-cols-1", DESKTOP_COLS[cols], GAP[gap], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Grid.displayName = "Grid";

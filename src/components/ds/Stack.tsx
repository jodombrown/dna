import * as React from "react";
import { cn } from "@/lib/utils";

const GAP = {
  s: "gap-2",
  m: "gap-4",
  l: "gap-6",
  xl: "gap-8",
} as const;

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: keyof typeof GAP;
  direction?: "column" | "row";
  align?: "start" | "center" | "end" | "stretch";
  wrap?: boolean;
}

/**
 * Spacing belongs to the parent: Stack owns the gap between its children so
 * no child ever needs a margin to know what sits next to it.
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ gap = "m", direction = "column", align, wrap, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        GAP[gap],
        align === "start" && "items-start",
        align === "center" && "items-center",
        align === "end" && "items-end",
        align === "stretch" && "items-stretch",
        wrap && "flex-wrap",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Stack.displayName = "Stack";

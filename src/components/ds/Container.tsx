import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** narrow: reading column (article body). default: standard page width. */
  width?: "default" | "narrow";
}

/** Centered content column. Holds Stacks and Grids, nothing else. */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ width = "default", className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full",
        width === "narrow" ? "max-w-3xl" : "max-w-6xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Container.displayName = "Container";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** default: page background. muted: recessed panel, for rhythm breaks between sections. */
  tone?: "default" | "muted";
  as?: "section" | "div";
}

/**
 * Page-level rhythm unit. Every page section is a Section holding one
 * Container. Padding is fixed here (32px/20px mobile, 40px/48px desktop)
 * so no page ever hand-rolls its own py-/px-.
 */
export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ tone = "default", as = "section", className, children, ...props }, ref) => {
    const Comp = as as "section";
    return (
      <Comp
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          "py-8 px-5 md:py-10 md:px-12",
          tone === "muted" ? "bg-muted" : "bg-background",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
Section.displayName = "Section";

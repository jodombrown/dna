import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { GHANA_PATHWAYS } from "@/pages/countries/ghana/pathwayMeta";

/** Sticky pathway nav strip, 56px at both breakpoints, horizontal scroll. */
export function GhanaNavStrip() {
  const { pathwayId } = useParams<{ pathwayId?: string }>();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const updateFades = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    updateFades();
    window.addEventListener("resize", updateFades);
    return () => window.removeEventListener("resize", updateFades);
  }, [updateFades]);

  return (
    <div className="sticky top-14 md:top-16 z-30 h-14 border-b border-border relative">
      <nav
        ref={scrollRef}
        onScroll={updateFades}
        className="h-full bg-glass backdrop-blur-glass overflow-x-auto"
        aria-label="Ghana pathways"
      >
        <ul className="flex h-full w-max items-center gap-2 px-5 md:px-12">
          {GHANA_PATHWAYS.map((pathway) => {
            const active = pathway.id === pathwayId;
            return (
              <li key={pathway.id}>
                <Link
                  to={`/west-africa/ghana/${pathway.id}`}
                  className={cn(
                    "inline-flex h-8 items-center rounded-dna-lg px-3 text-meta whitespace-nowrap transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-dna-sand"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {pathway.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-8 ghana-nav-fade-left transition-opacity",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-8 ghana-nav-fade-right transition-opacity",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

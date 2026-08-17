import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { GHANA_PATHWAYS } from "@/pages/countries/ghana/pathwayMeta";

/** Sticky pathway nav strip, 56px at both breakpoints, horizontal scroll. */
export function GhanaNavStrip() {
  const { pathwayId } = useParams<{ pathwayId?: string }>();

  return (
    <nav
      className="sticky top-14 md:top-16 z-30 h-14 bg-glass backdrop-blur-glass border-b border-border overflow-x-auto"
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
  );
}

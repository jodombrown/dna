import * as React from "react";
import { Link } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import dnaLogo from "@/assets/dna-logo-trimmed.png";

export interface GhanaHeaderProps {
  onOpenDrawer?: () => void;
  onOpenSearch?: () => void;
}

/**
 * Sticky glass header, 56px mobile / 64px desktop. Drawer and search
 * buttons call back up to GhanaPublicShell, which owns the drawer and
 * search overlay state.
 *
 * DNA mark, divider, country wordmark: this composition is the template
 * header for all 54 country pages. The wordmark is the only country-specific
 * value; everything else here stays fixed.
 */
export function GhanaHeader({ onOpenDrawer, onOpenSearch }: GhanaHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-14 md:h-16",
        "bg-glass backdrop-blur-glass",
        "border-b border-border"
      )}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-5 md:px-12">
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="DNA home" className="flex items-center">
            <img
              src={dnaLogo}
              alt="DNA, Diaspora Network of Africa"
              className="h-7 w-auto md:h-8"
            />
          </Link>
          <span className="h-5 w-px bg-border md:h-6" aria-hidden />
          <Link to="/west-africa/ghana" className="font-heritage text-h3 text-foreground">
            Ghana
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search Ghana"
            className={cn(
              "flex size-8 md:size-9 items-center justify-center rounded-dna-md",
              "text-foreground hover:bg-dna-sand active:bg-dna-stone transition-colors"
            )}
          >
            <Search className="size-4" />
          </button>
          <button
            type="button"
            onClick={onOpenDrawer}
            aria-label="Open menu"
            className={cn(
              "flex size-8 md:size-9 items-center justify-center rounded-dna-md",
              "text-foreground hover:bg-dna-sand active:bg-dna-stone transition-colors"
            )}
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

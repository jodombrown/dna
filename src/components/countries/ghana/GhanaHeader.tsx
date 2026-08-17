import * as React from "react";
import { Link } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GhanaHeaderProps {
  onOpenDrawer?: () => void;
  onOpenSearch?: () => void;
}

/**
 * Sticky glass header, 56px mobile / 64px desktop. Drawer and search buttons
 * are wired to no-ops until PR3 (nav, drawer, search) lands.
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
        <Link to="/west-africa/ghana" className="font-heritage text-h3 text-foreground">
          Ghana
        </Link>
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

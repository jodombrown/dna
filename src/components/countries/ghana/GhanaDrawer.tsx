import * as React from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { GHANA_PATHWAYS } from "@/pages/countries/ghana/pathwayMeta";
import { matchAfricanCountry } from "@/pages/countries/ghana/countryRedirect";
import { CountryRedirectCard } from "./CountryRedirectCard";

export interface GhanaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Left slide-in drawer for the Ghana header's hamburger button. 78% of
 * viewport width capped at 300px on mobile, fixed 320px on desktop. Radix
 * Dialog (via Sheet) provides the focus trap and Escape close for free, but
 * its default close-focus only restores to a rendered SheetTrigger. There is
 * none here (the trigger lives in GhanaHeader, wired through a callback), so
 * focus restoration is handled manually below.
 */
export function GhanaDrawer({ open, onOpenChange }: GhanaDrawerProps) {
  const [query, setQuery] = React.useState("");
  const previouslyFocused = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
    } else {
      setQuery("");
    }
  }, [open]);

  const trimmed = query.trim();
  const redirectTarget = matchAfricanCountry(trimmed);
  const filteredPathways = GHANA_PATHWAYS.filter((pathway) =>
    pathway.label.toLowerCase().includes(trimmed.toLowerCase())
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[78vw] max-w-[300px] border-r border-border bg-background p-0 shadow-dna-4 md:w-80 md:max-w-none"
        onPointerDownOutside={() => onOpenChange(false)}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          previouslyFocused.current?.focus();
        }}
      >
        <SheetTitle className="sr-only">Ghana navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Search Ghana pathways or go to a pathway directly.
        </SheetDescription>
        <div className="flex h-full flex-col gap-4 p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              variant="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Ghana"
              aria-label="Search Ghana"
              autoFocus
            />
          </div>

          {redirectTarget ? (
            <CountryRedirectCard target={redirectTarget} />
          ) : (
            <nav aria-label="Ghana navigation" className="flex flex-col gap-1 overflow-y-auto">
              <SheetClose asChild>
                <Link
                  to="/west-africa/ghana"
                  className="rounded-dna-md px-3 py-2 font-heritage text-h3 text-foreground hover:bg-dna-sand"
                >
                  Home
                </Link>
              </SheetClose>
              {filteredPathways.length > 0 ? (
                filteredPathways.map((pathway) => (
                  <SheetClose asChild key={pathway.id}>
                    <Link
                      to={`/west-africa/ghana/${pathway.id}`}
                      className="rounded-dna-md px-3 py-2 text-body text-foreground hover:bg-dna-sand"
                    >
                      {pathway.label}
                    </Link>
                  </SheetClose>
                ))
              ) : (
                <p className="px-3 py-2 text-meta text-muted-foreground">
                  No pathways match "{trimmed}".
                </p>
              )}
            </nav>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

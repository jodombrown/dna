import * as React from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Container } from "@/components/ds/Container";
import { Stack } from "@/components/ds/Stack";
import { Input } from "@/components/ui/input";
import { GHANA_PATHWAYS, getPathwayLabel } from "@/pages/countries/ghana/pathwayMeta";
import { PLACEHOLDER_ARTICLES } from "@/content/ghana-articles";
import { matchAfricanCountry } from "@/pages/countries/ghana/countryRedirect";
import { CountryRedirectCard } from "./CountryRedirectCard";
import { useFocusTrap } from "./useFocusTrap";

export interface GhanaSearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Inline search surface anchored beneath the nav strip, not a modal. Renders
 * in normal document flow (no fixed positioning) so it cannot trap page
 * scroll, and sits at a lower z-index than the sticky header and nav strip
 * so both stay visible above it.
 */
export function GhanaSearchOverlay({ open, onClose }: GhanaSearchOverlayProps) {
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useFocusTrap(open, containerRef, onClose);

  React.useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
    }
  }, [open]);

  if (!open) return null;

  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();
  const redirectTarget = matchAfricanCountry(trimmed);
  const matchedPathways = trimmed
    ? GHANA_PATHWAYS.filter((pathway) => pathway.label.toLowerCase().includes(lower))
    : [];
  const matchedArticles = trimmed
    ? PLACEHOLDER_ARTICLES.filter((article) => article.headline.toLowerCase().includes(lower))
    : [];
  const totalResults = matchedPathways.length + matchedArticles.length;

  return (
    <div ref={containerRef} className="relative z-20 border-b border-border bg-background">
      <Container>
        <Stack gap="m" className="py-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              variant="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Ghana pathways and stories"
              aria-label="Search Ghana pathways and stories"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-dna-md text-foreground hover:bg-dna-sand"
            >
              <X className="size-4" />
            </button>
          </div>

          {redirectTarget ? (
            <CountryRedirectCard target={redirectTarget} />
          ) : !trimmed ? (
            <p className="text-meta text-muted-foreground">
              Start typing to search Ghana pathways and stories.
            </p>
          ) : totalResults === 0 ? (
            <p className="text-meta text-muted-foreground">No results for "{trimmed}".</p>
          ) : (
            <>
              <p className="font-heritage italic text-meta text-primary">
                DIA matched {totalResults} results across Ghana
              </p>
              <Stack gap="l">
                {matchedPathways.length > 0 && (
                  <Stack gap="s">
                    <h3 className="font-heritage text-h3 text-foreground">Pathways</h3>
                    <ul className="flex flex-col gap-1">
                      {matchedPathways.map((pathway) => (
                        <li key={pathway.id}>
                          <Link
                            to={`/west-africa/ghana/${pathway.id}`}
                            onClick={onClose}
                            className="block rounded-dna-md px-2 py-1.5 text-body text-foreground hover:bg-dna-sand"
                          >
                            {pathway.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Stack>
                )}
                {matchedArticles.length > 0 && (
                  <Stack gap="s">
                    <h3 className="font-heritage text-h3 text-foreground">Stories</h3>
                    <ul className="flex flex-col gap-1">
                      {matchedArticles.map((article) => (
                        <li key={article.id}>
                          <Link
                            to={`/west-africa/ghana/${article.pathwayId}/${article.id}`}
                            onClick={onClose}
                            className="block rounded-dna-md px-2 py-1.5 text-body text-foreground hover:bg-dna-sand"
                          >
                            <span className="block text-meta uppercase tracking-wide text-muted-foreground">
                              {getPathwayLabel(article.pathwayId)}
                            </span>
                            {article.headline}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Stack>
                )}
              </Stack>
            </>
          )}
        </Stack>
      </Container>
    </div>
  );
}

import * as React from "react";
import { hasPage, type CountryRedirectTarget } from "@/pages/countries/ghana/countryRedirect";

export interface CountryRedirectCardProps {
  target: CountryRedirectTarget;
}

/**
 * Shown in place of normal results when a search resolves to an African
 * country other than Ghana. Never a live link to a route that 404s: the
 * hasPage predicate is the only thing that decides whether the country name
 * becomes a clickable link, so a page that does not exist reads as
 * not-yet-available instead of breaking.
 */
export function CountryRedirectCard({ target }: CountryRedirectCardProps) {
  const live = hasPage(target.slug);

  return (
    <div className="rounded-dna-lg border border-dna-stone bg-card p-4 shadow-dna-1">
      <p className="font-heritage text-h3 text-foreground">
        This search stays on Ghana. Looking for {target.name}?
      </p>
      {live ? (
        <a href={`/${target.slug}`} className="mt-2 inline-block text-body text-primary underline">
          Go to {target.name}
        </a>
      ) : (
        <p className="mt-2 text-meta text-muted-foreground">
          {target.name}'s page is not available yet.
        </p>
      )}
    </div>
  );
}

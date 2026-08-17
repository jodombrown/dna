// AFRICAN_COUNTRIES also exists in HeritageOnboardingStep.tsx, with a
// different shape (code/name/region, for the onboarding heritage picker).
// The two lists are unrelated. Aliased on import here so this file can never
// be mistaken for that one. Reconciling them belongs to the 54-country
// generalization pass, not this PR.
import { AFRICAN_COUNTRIES as COUNTRY_REDIRECT_TARGETS } from "@/content/ghana-content";

export interface CountryRedirectTarget {
  name: string;
  slug: string;
}

/**
 * TODO(provisional): this is a blunt substring matcher ported as-is from the
 * design prototype, not real search matching. It will produce edge-case
 * false positives (short country names swallowing unrelated queries). It is
 * correct for demonstrating the country-redirect pattern and wrong as a
 * permanent implementation. Do not "improve" it here; replace it when real
 * search lands.
 */
export function matchAfricanCountry(query: string): CountryRedirectTarget | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();

  const exact = COUNTRY_REDIRECT_TARGETS.find(([name]) => name.toLowerCase() === lower);
  if (exact) return { name: exact[0], slug: exact[1] };

  if (lower.length >= 4) {
    const prefix = COUNTRY_REDIRECT_TARGETS.find(([name]) => name.toLowerCase().startsWith(lower));
    return prefix ? { name: prefix[0], slug: prefix[1] } : null;
  }

  const substring = COUNTRY_REDIRECT_TARGETS.find(
    ([name]) => name.length >= 4 && name.toLowerCase().includes(lower)
  );
  return substring ? { name: substring[0], slug: substring[1] } : null;
}

/**
 * Only Ghana has a live page today; every other country slug in
 * AFRICAN_COUNTRIES resolves to a 404. This predicate is the single place
 * that knows that. When the 54-country generalization lands, this becomes a
 * real route lookup and every caller flips to live links automatically.
 */
export function hasPage(slug: string): boolean {
  return slug === "west-africa/ghana";
}

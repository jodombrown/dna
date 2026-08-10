/**
 * DNA | CONVENE — the desktop/tablet Rail: Browse's six facets, always
 * visible from md: up. Same values, same words as the mobile Narrow sheet
 * (ConveneFacetControls is the one shared control set).
 */
import type { ReactNode } from 'react';
import { ConveneFacetControls, type ConveneFacetKey, type ConveneFacetValues } from './ConveneFacetControls';

interface ConveneFacetRailProps {
  values: ConveneFacetValues;
  onChange: (key: ConveneFacetKey, value: string) => void;
  countries: string[];
  categories: string[];
  /** Upcoming Events + DIA hub — desktop-only content that stacks below the
   *  Rail's facets in the same column, per the Seam Map's width rule: the
   *  Rail itself starts at md:, the legacy sidebar content waits for lg:. */
  children?: ReactNode;
}

export function ConveneFacetRail({ values, onChange, countries, categories, children }: ConveneFacetRailProps) {
  return (
    <div
      className="hidden md:block sticky space-y-6"
      style={{ top: 'var(--total-header-height, 7.5rem)' }}
    >
      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <h2 className="text-h3 text-foreground">Narrow Results</h2>
        <ConveneFacetControls
          values={values}
          onChange={onChange}
          countries={countries}
          categories={categories}
          className="space-y-4"
        />
      </div>

      {children}
    </div>
  );
}

export default ConveneFacetRail;

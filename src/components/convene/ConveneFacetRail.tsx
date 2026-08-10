/**
 * DNA | CONVENE — Browse's six facets, the content of AppShell's `context`
 * rail (280px, left). AppShell owns the column itself — width, scroll,
 * visibility below md: — so this renders its content only, no wrapper.
 * Same values, same words as the mobile Narrow sheet (ConveneFacetControls
 * is the one shared control set).
 */
import { ConveneFacetControls, type ConveneFacetKey, type ConveneFacetValues } from './ConveneFacetControls';

interface ConveneFacetRailProps {
  values: ConveneFacetValues;
  onChange: (key: ConveneFacetKey, value: string) => void;
  countries: string[];
  categories: string[];
}

export function ConveneFacetRail({ values, onChange, countries, categories }: ConveneFacetRailProps) {
  return (
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
  );
}

export default ConveneFacetRail;

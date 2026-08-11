/**
 * DNA | CONVENE — Browse's six facets: when · where · format · type ·
 * category · price. One naming convention, one control set, shared by the
 * desktop/tablet Rail and the mobile Narrow sheet — never two different
 * facet UIs.
 *
 * Folded from the old events index's filters, with two corrections: Type
 * carries all seven event_type values including "other" (that dropdown only
 * ever offered six), and Price is new — Free lives here as a facet value,
 * not as a Lens.
 */
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface ConveneFacetValues {
  when: string;
  where: string;
  format: string;
  type: string;
  category: string;
  price: string;
}

export type ConveneFacetKey = keyof ConveneFacetValues;

interface ConveneFacetControlsProps {
  values: ConveneFacetValues;
  onChange: (key: ConveneFacetKey, value: string) => void;
  countries: string[];
  categories: string[];
  className?: string;
}

function FacetField({
  label,
  value,
  onValueChange,
  children,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-meta text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-9 text-body">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

export function ConveneFacetControls({
  values,
  onChange,
  countries,
  categories,
  className,
}: ConveneFacetControlsProps) {
  const set = (key: ConveneFacetKey) => (v: string) => onChange(key, v === 'all' ? '' : v);

  return (
    <div className={className}>
      <FacetField label="When" value={values.when || 'upcoming'} onValueChange={set('when')}>
        <SelectItem value="upcoming">Upcoming</SelectItem>
        <SelectItem value="today">Today</SelectItem>
        <SelectItem value="this_week">This Week</SelectItem>
        <SelectItem value="this_month">This Month</SelectItem>
        <SelectItem value="past">Past</SelectItem>
        <SelectItem value="watching">Undated / Watching</SelectItem>
      </FacetField>

      <FacetField label="Where" value={values.where || 'all'} onValueChange={set('where')}>
        <SelectItem value="all">All Locations</SelectItem>
        {countries.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </FacetField>

      <FacetField label="Format" value={values.format || 'all'} onValueChange={set('format')}>
        <SelectItem value="all">All Formats</SelectItem>
        <SelectItem value="in_person">In-Person</SelectItem>
        <SelectItem value="virtual">Virtual</SelectItem>
        <SelectItem value="hybrid">Hybrid</SelectItem>
      </FacetField>

      <FacetField label="Type" value={values.type || 'all'} onValueChange={set('type')}>
        <SelectItem value="all">All Types</SelectItem>
        <SelectItem value="conference">Conference</SelectItem>
        <SelectItem value="workshop">Workshop</SelectItem>
        <SelectItem value="meetup">Meetup</SelectItem>
        <SelectItem value="webinar">Webinar</SelectItem>
        <SelectItem value="networking">Networking</SelectItem>
        <SelectItem value="social">Social</SelectItem>
        <SelectItem value="other">Other</SelectItem>
      </FacetField>

      <FacetField label="Category" value={values.category || 'all'} onValueChange={set('category')}>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </FacetField>

      <FacetField label="Price" value={values.price || 'all'} onValueChange={set('price')}>
        <SelectItem value="all">Any Price</SelectItem>
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="paid">Paid</SelectItem>
      </FacetField>
    </div>
  );
}

export default ConveneFacetControls;

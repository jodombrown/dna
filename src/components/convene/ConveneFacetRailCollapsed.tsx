/**
 * DNA | CONVENE — Browse's six facets, collapsed to a 64px icon strip. Pack
 * 19 S97: when a hosted detail (BD-EventDetail-host-agnostic) widens
 * AppShell's `related` column, `context` narrows to this in the same
 * render (see AppShell's `hostedDetail` prop). Every facet stays reachable
 * as an icon-only affordance; selecting one drives the exact same
 * `onChange` the expanded ConveneFacetRail uses, so the URL params and
 * composition rules (Lens Bar included) never diverge between the two
 * renderings of the same six facets.
 *
 * Not a second control set: this wraps the same Select primitives
 * ConveneFacetControls uses, it only swaps the visible trigger from a
 * labelled row to an icon button. There is no ConveneFacetControls
 * duplication of option lists here — SelectItem children are passed in the
 * same shape both components already share.
 */
import type { LucideIcon } from 'lucide-react';
import { Calendar, MapPin, Video, LayoutGrid, Tag, DollarSign } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ConveneFacetKey, ConveneFacetValues } from './ConveneFacetControls';

interface ConveneFacetRailCollapsedProps {
  values: ConveneFacetValues;
  onChange: (key: ConveneFacetKey, value: string) => void;
  countries: string[];
  categories: string[];
}

// Order matches ConveneFacetControls top-to-bottom: when, where, format,
// type, category, price.
const FACET_ICONS: Record<ConveneFacetKey, { icon: LucideIcon; label: string }> = {
  when: { icon: Calendar, label: 'When' },
  where: { icon: MapPin, label: 'Where' },
  format: { icon: Video, label: 'Format' },
  type: { icon: LayoutGrid, label: 'Type' },
  category: { icon: Tag, label: 'Category' },
  price: { icon: DollarSign, label: 'Price' },
};

function CollapsedFacetField({
  facetKey,
  value,
  active,
  onValueChange,
  children,
}: {
  facetKey: ConveneFacetKey;
  value: string;
  active: boolean;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}) {
  const { icon: Icon, label } = FACET_ICONS[facetKey];
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        aria-label={label}
        title={label}
        className={cn(
          // 64x64: the rail's own width doubles as the touch target, so the
          // collapsed strip is never a decorative sliver of the expanded one.
          'relative flex h-16 w-16 items-center justify-center rounded-none border-none bg-transparent p-0 hover:bg-muted focus:ring-inset',
          // Hides only the trigger's own chevron (the last direct-child svg);
          // the facet icon below is wrapped in a span, so it survives.
          '[&>svg:last-child]:hidden',
          active && 'bg-dna-copper/12 text-dna-copper',
        )}
      >
        <span>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

export function ConveneFacetRailCollapsed({
  values,
  onChange,
  countries,
  categories,
}: ConveneFacetRailCollapsedProps) {
  const set = (key: ConveneFacetKey) => (v: string) => onChange(key, v === 'all' ? '' : v);

  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card py-2">
      <CollapsedFacetField
        facetKey="when"
        value={values.when || 'upcoming'}
        active={!!values.when}
        onValueChange={set('when')}
      >
        <SelectItem value="upcoming">Upcoming</SelectItem>
        <SelectItem value="today">Today</SelectItem>
        <SelectItem value="this_week">This Week</SelectItem>
        <SelectItem value="this_month">This Month</SelectItem>
        <SelectItem value="past">Past</SelectItem>
        <SelectItem value="watching">Undated / Watching</SelectItem>
      </CollapsedFacetField>

      <CollapsedFacetField
        facetKey="where"
        value={values.where || 'all'}
        active={!!values.where}
        onValueChange={set('where')}
      >
        <SelectItem value="all">All Locations</SelectItem>
        {countries.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </CollapsedFacetField>

      <CollapsedFacetField
        facetKey="format"
        value={values.format || 'all'}
        active={!!values.format}
        onValueChange={set('format')}
      >
        <SelectItem value="all">All Formats</SelectItem>
        <SelectItem value="in_person">In-Person</SelectItem>
        <SelectItem value="virtual">Virtual</SelectItem>
        <SelectItem value="hybrid">Hybrid</SelectItem>
      </CollapsedFacetField>

      <CollapsedFacetField
        facetKey="type"
        value={values.type || 'all'}
        active={!!values.type}
        onValueChange={set('type')}
      >
        <SelectItem value="all">All Types</SelectItem>
        <SelectItem value="conference">Conference</SelectItem>
        <SelectItem value="workshop">Workshop</SelectItem>
        <SelectItem value="meetup">Meetup</SelectItem>
        <SelectItem value="webinar">Webinar</SelectItem>
        <SelectItem value="networking">Networking</SelectItem>
        <SelectItem value="social">Social</SelectItem>
        <SelectItem value="other">Other</SelectItem>
      </CollapsedFacetField>

      <CollapsedFacetField
        facetKey="category"
        value={values.category || 'all'}
        active={!!values.category}
        onValueChange={set('category')}
      >
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </CollapsedFacetField>

      <CollapsedFacetField
        facetKey="price"
        value={values.price || 'all'}
        active={!!values.price}
        onValueChange={set('price')}
      >
        <SelectItem value="all">Any Price</SelectItem>
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="paid">Paid</SelectItem>
      </CollapsedFacetField>
    </div>
  );
}

export default ConveneFacetRailCollapsed;

import { cn } from '@/lib/utils';

/* ──────────────────────────────────────────────
   Pill Filter Bar (Desktop only now)
   ────────────────────────────────────────────── */
const PILLS = [
  { id: 'all', label: 'All' },
  { id: 'near_me', label: 'Near Me' },
  { id: 'this_week', label: 'This Week' },
  { id: 'online', label: 'Virtual' },
  { id: 'free', label: 'Free' },
  { id: 'network', label: 'My Network' },
] as const;

export function ConvenePillFilterBar({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
      {PILLS.map((pill) => {
        const isActive = active === pill.id;
        return (
          <button
            key={pill.id}
            onClick={() => onSelect(pill.id)}
            className={cn(
              'h-9 flex items-center px-4 rounded-full text-body font-medium whitespace-nowrap transition-all shrink-0',
              'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'bg-dna-copper text-white border-dna-copper shadow-sm'
                : 'bg-background text-foreground border-border hover:border-dna-copper/40 hover:bg-dna-copper/5',
            )}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}

export default ConvenePillFilterBar;

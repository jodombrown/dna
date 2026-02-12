/**
 * DNA | NotificationFilterBar
 *
 * Horizontal scrolling filter chips for Five C's module filtering.
 * Follows the same pattern as the Composer mode selector.
 */

import { cn } from '@/lib/utils';
import { NOTIFICATION_FILTERS } from '@/types/notificationSystem';
import { CModule } from '@/types/composer';
import {
  Users, Calendar, Briefcase, Target, BookOpen,
} from 'lucide-react';

const MODULE_ICONS: Record<string, React.ReactNode> = {
  [CModule.CONNECT]: <Users className="h-3.5 w-3.5" />,
  [CModule.CONVENE]: <Calendar className="h-3.5 w-3.5" />,
  [CModule.COLLABORATE]: <Briefcase className="h-3.5 w-3.5" />,
  [CModule.CONTRIBUTE]: <Target className="h-3.5 w-3.5" />,
  [CModule.CONVEY]: <BookOpen className="h-3.5 w-3.5" />,
};

interface NotificationFilterBarProps {
  activeFilter: CModule | 'all';
  onFilterChange: (filter: CModule | 'all') => void;
  badgeCounts?: Record<string, number>;
}

export function NotificationFilterBar({
  activeFilter,
  onFilterChange,
  badgeCounts = {},
}: NotificationFilterBarProps) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto scrollbar-hide border-b">
      {NOTIFICATION_FILTERS.map((filter) => {
        const isActive = activeFilter === filter.value;
        const count = filter.value !== 'all' ? badgeCounts[filter.value] || 0 : 0;
        const icon = filter.value !== 'all' ? MODULE_ICONS[filter.value] : null;

        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              'border',
              isActive
                ? 'text-white border-transparent'
                : 'text-muted-foreground border-border hover:bg-accent hover:text-foreground'
            )}
            style={isActive && filter.color ? { backgroundColor: filter.color } : undefined}
          >
            {icon}
            <span>{filter.label}</span>
            {count > 0 && (
              <span className={cn(
                'ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-muted text-muted-foreground'
              )}>
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

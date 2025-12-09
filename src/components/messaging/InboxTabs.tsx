import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { InboxTab } from '@/types/messaging';

interface InboxTabsProps {
  activeTab: InboxTab;
  onTabChange: (tab: InboxTab) => void;
  focusedCount?: number;
  otherCount?: number;
  requestsCount?: number;
}

/**
 * InboxTabs - LinkedIn-style inbox filtering
 *
 * Implements the PRD requirement for:
 * - Focused: Active conversations with connected users
 * - Other: Muted or low-priority conversations
 * - Requests: Pending message requests from non-connected users
 */
const InboxTabs: React.FC<InboxTabsProps> = ({
  activeTab,
  onTabChange,
  focusedCount,
  otherCount,
  requestsCount,
}) => {
  const tabs: { id: InboxTab; label: string; count?: number }[] = [
    { id: 'focused', label: 'Focused', count: focusedCount },
    { id: 'other', label: 'Other', count: otherCount },
    { id: 'requests', label: 'Requests', count: requestsCount },
  ];

  return (
    <div className="flex border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex-1 px-4 py-2 text-sm font-medium transition-colors relative',
            'hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            activeTab === tab.id
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <Badge
                variant={activeTab === tab.id ? 'default' : 'secondary'}
                className="rounded-full px-2 py-0 text-xs h-5 min-w-[20px]"
              >
                {tab.count > 99 ? '99+' : tab.count}
              </Badge>
            )}
          </div>

          {/* Active indicator */}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
};

export default InboxTabs;

/**
 * Compact version for mobile/overlay
 */
export const InboxTabsCompact: React.FC<InboxTabsProps> = ({
  activeTab,
  onTabChange,
  focusedCount,
  otherCount,
  requestsCount,
}) => {
  const tabs: { id: InboxTab; label: string; count?: number }[] = [
    { id: 'focused', label: 'All', count: focusedCount },
    { id: 'requests', label: 'Requests', count: requestsCount },
  ];

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
            activeTab === tab.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <div className="flex items-center justify-center gap-1.5">
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted-foreground/20'
                )}
              >
                {tab.count > 99 ? '99+' : tab.count}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

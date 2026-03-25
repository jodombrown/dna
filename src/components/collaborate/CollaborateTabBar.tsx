import React from 'react';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';

export type CollaborateTab = 'spaces' | 'opportunities' | 'activity';

interface CollaborateTabBarProps {
  activeTab: CollaborateTab;
  onTabChange: (tab: CollaborateTab) => void;
  spacesCount?: number;
  opportunitiesCount?: number;
}

const tabs: { key: CollaborateTab; label: string; mobileLabel: string }[] = [
  { key: 'spaces', label: 'Spaces', mobileLabel: 'Spaces' },
  { key: 'opportunities', label: 'Opportunities', mobileLabel: 'Opps' },
  { key: 'activity', label: 'My Activity', mobileLabel: 'Activity' },
];

export function CollaborateTabBar({
  activeTab,
  onTabChange,
  spacesCount,
  opportunitiesCount,
}: CollaborateTabBarProps) {
  const { isMobile } = useMobile();

  const getCount = (key: CollaborateTab) => {
    if (key === 'spaces') return spacesCount;
    if (key === 'opportunities') return opportunitiesCount;
    return undefined;
  };

  return (
    <div className="border-b border-border">
      <nav className="flex gap-0" aria-label="Collaborate tabs">
        {tabs.map((tab) => {
          const count = getCount(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                'relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors min-h-[44px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-selected={isActive}
              role="tab"
            >
              <span>{isMobile ? tab.mobileLabel : tab.label}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full',
                    'bg-[hsl(153,43%,32%)] text-white'
                  )}
                >
                  {count > 99 ? '99+' : count}
                </span>
              )}
              {/* Active underline */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

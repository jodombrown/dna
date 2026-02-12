/**
 * DNA | FEED v2 - Feed Header
 *
 * Feed type indicator, contextual filters, and sort toggle.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { SlidersHorizontal, ChevronDown, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { FeedType, FeedSortMode, type FeedFilters, type FeedTierConfig } from '@/types/feedTypes';
import { CModule } from '@/types/composer';
import { FEED_EMPTY_STATES, C_MODULE_LABELS } from '@/lib/feedConfig';

interface FeedHeaderProps {
  feedType: FeedType;
  sortMode: FeedSortMode;
  filters: FeedFilters;
  tierConfig: FeedTierConfig;
  onSortChange: (mode: FeedSortMode) => void;
  onFilterChange: (filters: Partial<FeedFilters>) => void;
  newItemCount: number;
  onNewItemsBannerClick: () => void;
}

const SORT_MODE_CONFIG: Record<FeedSortMode, { label: string; icon: React.FC<{ className?: string }> }> = {
  [FeedSortMode.FOR_YOU]: { label: 'For You', icon: Sparkles },
  [FeedSortMode.RECENT]: { label: 'Recent', icon: Clock },
  [FeedSortMode.TRENDING]: { label: 'Trending', icon: TrendingUp },
};

const FEED_TYPE_LABELS: Record<FeedType, string> = {
  [FeedType.UNIVERSAL]: 'Feed',
  [FeedType.CONNECT]: 'Connect',
  [FeedType.CONVENE]: 'Events',
  [FeedType.COLLABORATE]: 'Spaces',
  [FeedType.CONTRIBUTE]: 'Opportunities',
  [FeedType.CONVEY]: 'Stories',
};

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  feedType,
  sortMode,
  filters,
  tierConfig,
  onSortChange,
  onFilterChange,
  newItemCount,
  onNewItemsBannerClick,
}) => {
  const currentSort = SORT_MODE_CONFIG[sortMode];
  const SortIcon = currentSort.icon;

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/30">
      {/* New items banner */}
      {newItemCount > 0 && (
        <button
          onClick={onNewItemsBannerClick}
          className="w-full py-2 text-center text-xs font-medium text-dna-emerald bg-dna-emerald/5 hover:bg-dna-emerald/10 transition-colors"
        >
          {newItemCount} new {newItemCount === 1 ? 'update' : 'updates'}
        </button>
      )}

      <div className="px-4 py-3 md:px-5">
        <div className="flex items-center justify-between">
          {/* Feed type label */}
          <h2 className="text-lg font-semibold">{FEED_TYPE_LABELS[feedType]}</h2>

          {/* Sort toggle and filter */}
          <div className="flex items-center gap-2">
            {/* Sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
                  <SortIcon className="w-3.5 h-3.5" />
                  {currentSort.label}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {tierConfig.sortModes.map((mode) => {
                  const config = SORT_MODE_CONFIG[mode];
                  const Icon = config.icon;
                  return (
                    <DropdownMenuItem
                      key={mode}
                      onClick={() => onSortChange(mode)}
                      className={cn(sortMode === mode && 'bg-accent')}
                    >
                      <Icon className="w-3.5 h-3.5 mr-2" />
                      {config.label}
                    </DropdownMenuItem>
                  );
                })}
                {/* Show locked Trending for free tier */}
                {!tierConfig.sortModes.includes(FeedSortMode.TRENDING) && (
                  <DropdownMenuItem disabled className="opacity-50">
                    <TrendingUp className="w-3.5 h-3.5 mr-2" />
                    Trending
                    <Badge variant="outline" className="ml-2 text-[8px] h-4">
                      PRO
                    </Badge>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filter button (Universal feed only) */}
            {feedType === FeedType.UNIVERSAL && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <SlidersHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onFilterChange({ cModules: undefined })}>
                    All C-Modules
                  </DropdownMenuItem>
                  {Object.values(CModule).map((c) => (
                    <DropdownMenuItem
                      key={c}
                      onClick={() => onFilterChange({ cModules: [c] })}
                      className={cn(
                        filters.cModules?.includes(c) && 'bg-accent'
                      )}
                    >
                      {C_MODULE_LABELS[c] || c}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

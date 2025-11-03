import { useState } from 'react';
import { useOpportunityFilters } from '@/hooks/useOpportunityFilters';
import { useOpportunityBookmark } from '@/hooks/useOpportunityBookmark';
import OpportunityFilters from '@/components/opportunities/OpportunityFilters';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import OpportunityControls from '@/components/opportunities/OpportunityControls';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus } from 'lucide-react';
import { Profile } from '@/services/profilesService';

interface DashboardImpactColumnProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export default function DashboardImpactColumn({ profile, isOwnProfile }: DashboardImpactColumnProps) {
  const {
    filters,
    opportunities,
    isLoading,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    resultCount,
    sortBy,
    setSortBy,
  } = useOpportunityFilters();
  
  const { bookmarkedIds, toggleBookmark } = useOpportunityBookmark();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const handleBookmark = (id: string) => {
    toggleBookmark(id);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contribute</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Discover opportunities to make an impact across Africa
          </p>
        </div>
        {isOwnProfile && (
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Post
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <OpportunityFilters
            filters={filters}
            onFiltersChange={(newFilters) => {
              Object.entries(newFilters).forEach(([key, value]) => {
                updateFilters(key as any, value);
              });
            }}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            resultCount={resultCount}
          />
        </div>

        {/* Opportunities List */}
        <div className="lg:col-span-3">
          {/* Controls */}
          {!isLoading && opportunities.length > 0 && (
            <OpportunityControls
              sortBy={sortBy}
              onSortChange={(value) => setSortBy(value)}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              resultCount={resultCount}
            />
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading opportunities...</p>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Briefcase className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-base font-semibold mb-1">
                No opportunities found
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                {hasActiveFilters 
                  ? "Try adjusting your filters to see more opportunities"
                  : "Check back soon for new contribution opportunities"
                }
              </p>
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  size="sm"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4' : 'space-y-4'}>
              {opportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onBookmark={handleBookmark}
                  isBookmarked={bookmarkedIds.has(opportunity.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

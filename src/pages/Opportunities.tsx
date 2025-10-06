import React from 'react';
import UnifiedHeader from '@/components/UnifiedHeader';
import { useOpportunityFilters } from '@/hooks/useOpportunityFilters';
import OpportunityFilters from '@/components/opportunities/OpportunityFilters';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Opportunities: React.FC = () => {
  const {
    filters,
    opportunities,
    isLoading,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    resultCount,
  } = useOpportunityFilters();
  
  const { toast } = useToast();

  const handleApply = (id: string) => {
    toast({
      title: "Application Started",
      description: "Opening application form...",
    });
  };

  const handleBookmark = (id: string) => {
    toast({
      title: "Bookmarked",
      description: "This opportunity has been saved to your bookmarks.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-dna-forest mb-2">
                Contribute
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover opportunities to make an impact across Africa through the diaspora network
              </p>
            </div>
            <Button className="bg-dna-copper hover:bg-dna-copper/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Post Opportunity
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
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
          </div>

          {/* Opportunities List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dna-copper mb-4"></div>
                <p className="text-muted-foreground">Loading opportunities...</p>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-lg border border-border">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-dna-forest mb-2">
                  No opportunities found
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {hasActiveFilters 
                    ? "Try adjusting your filters to see more opportunities"
                    : "Check back soon for new contribution opportunities from the community"
                  }
                </p>
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="border-dna-emerald text-dna-forest hover:bg-dna-emerald/10"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {opportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    onApply={handleApply}
                    onBookmark={handleBookmark}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Opportunities;

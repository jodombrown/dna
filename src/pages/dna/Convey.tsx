import { useState } from 'react';
import { FeedLayout } from '@/components/layout/FeedLayout';
import { ConveyFeedFilters } from '@/components/convey/ConveyFeedFilters';
import { ConveyFeedCard } from '@/components/convey/ConveyFeedCard';
import { useConveyFeed } from '@/hooks/useConveyFeed';
import { ConveyFilters } from '@/types/conveyTypes';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function Convey() {
  const [filters, setFilters] = useState<ConveyFilters>({});
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useConveyFeed({
    ...filters,
    page,
    pageSize: 20,
  });

  const handleFiltersChange = (newFilters: ConveyFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <FeedLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Stories from the DNA community
          </h1>
          <p className="text-lg text-muted-foreground">
            See how the African diaspora is connecting, convening, collaborating and contributing – in one feed.
          </p>
        </div>

        {/* Filters */}
        <ConveyFeedFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {/* Loading State */}
        {isLoading && page === 1 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <p className="text-destructive">
              Failed to load stories. Please try again.
            </p>
          </div>
        )}

        {/* Feed */}
        {!isLoading && !error && data && (
          <>
            {data.data.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <p className="text-lg text-muted-foreground">
                  {filters.type || filters.region || filters.onlyMySpaces
                    ? 'No stories match these filters yet. Try adjusting your filters or check back soon.'
                    : 'Stories from the DNA community will appear here once they are published.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.data.map((item) => (
                  <ConveyFeedCard key={item.id} item={item} />
                ))}

                {/* Load More */}
                {data.data.length >= 20 && (
                  <div className="flex justify-center pt-6">
                    <Button
                      onClick={handleLoadMore}
                      variant="outline"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load more'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </FeedLayout>
  );
}

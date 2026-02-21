import { useNavigate } from 'react-router-dom';
import { useSpaceConveyItems } from '@/hooks/useConveyFeed';
import { ConveyFeedCard } from './ConveyFeedCard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

interface SpaceUpdatesSectionProps {
  spaceId: string;
  spaceSlug: string;
  isLead: boolean;
}

export function SpaceUpdatesSection({ spaceId, spaceSlug, isLead }: SpaceUpdatesSectionProps) {
  const navigate = useNavigate();
  const { data: items, isLoading, error } = useSpaceConveyItems(spaceId);

  const handleCreateStory = () => {
    navigate(`/dna/convey/new?space_id=${spaceId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
        <p className="text-destructive">Failed to load updates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with CTA for leads */}
      {isLead && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Updates & Stories</h2>
            <p className="text-muted-foreground">
              Share progress and highlights with your community
            </p>
          </div>
          <Button onClick={handleCreateStory}>
            <Plus className="mr-2 h-4 w-4" />
            Post an update
          </Button>
        </div>
      )}

      {!isLead && (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Updates & Stories</h2>
        </div>
      )}

      {/* Items list */}
      {items && items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <ConveyFeedCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          {isLead ? (
            <>
              <p className="text-lg text-muted-foreground mb-4">
                No updates yet. Share your first story to keep your community in the loop.
              </p>
              <Button onClick={handleCreateStory}>
                <Plus className="mr-2 h-4 w-4" />
                Post an update
              </Button>
            </>
          ) : (
            <p className="text-lg text-muted-foreground">
              No updates shared yet. Check back soon.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

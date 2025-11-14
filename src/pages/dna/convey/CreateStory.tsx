import { useNavigate, useSearchParams } from 'react-router-dom';
import { FeedLayout } from '@/components/layout/FeedLayout';
import { ConveyItemForm } from '@/components/convey/ConveyItemForm';
import { useCreateConveyItem } from '@/hooks/useConveyMutations';
import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreateStory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const spaceId = searchParams.get('space_id');
  const eventId = searchParams.get('event_id');

  const createMutation = useCreateConveyItem();

  // Fetch space details if space_id is provided
  const { data: space, isLoading: isLoadingSpace } = useQuery({
    queryKey: ['space-for-story', spaceId],
    queryFn: async () => {
      if (!spaceId) return null;

      const { data, error } = await supabaseClient
        .from('spaces')
        .select('id, name, visibility, region')
        .eq('id', spaceId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!spaceId,
  });

  // Fetch event details if event_id is provided
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['event-for-story', eventId],
    queryFn: async () => {
      if (!eventId) return null;

      const { data, error } = await supabaseClient
        .from('events')
        .select('id, title')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  // Check if user is admin
  const { data: profile } = useQuery({
    queryKey: ['profile-for-story-auth'],
    queryFn: async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabaseClient
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const isAdmin = profile?.user_type === 'admin';

  const handleSubmit = async (formData: any) => {
    const data = {
      ...formData,
      primary_space_id: spaceId || undefined,
      primary_event_id: eventId || undefined,
      focus_areas: [], // TODO: Add focus area selection to form
    };

    const result = await createMutation.mutateAsync(data);

    // Navigate to the story detail page
    if (result?.slug) {
      navigate(`/dna/convey/stories/${result.slug}`);
    } else if (spaceId && space) {
      navigate(`/dna/collaborate/spaces/${space.slug || spaceId}#updates`);
    } else {
      navigate('/dna/convey');
    }
  };

  const handleCancel = () => {
    if (spaceId && space) {
      navigate(`/dna/collaborate/spaces/${space.slug || spaceId}#updates`);
    } else {
      navigate('/dna/convey');
    }
  };

  if (isLoadingSpace || isLoadingEvent) {
    return (
      <FeedLayout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            {spaceId ? 'Post an Update' : 'Create a Story'}
          </h1>
          <p className="text-muted-foreground">
            {spaceId
              ? 'Share progress, milestones, or news with your space members.'
              : 'Share a story, update, or impact highlight with the DNA community.'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <ConveyItemForm
            spaceId={spaceId || undefined}
            spaceName={space?.name}
            spaceVisibility={space?.visibility as any}
            eventId={eventId || undefined}
            eventTitle={event?.title}
            isAdmin={isAdmin}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createMutation.isPending}
          />
        </div>
      </div>
    </FeedLayout>
  );
}

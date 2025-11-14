import { useNavigate, useParams } from 'react-router-dom';
import { FeedLayout } from '@/components/layout/FeedLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEventAnalytics } from '@/hooks/useEventAnalytics';
import { EventAnalyticsCard } from '@/components/convene/analytics/EventAnalyticsCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const EventAnalytics = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading, error } = useEventAnalytics(id);

  if (eventLoading || analyticsLoading) {
    return (
      <FeedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </FeedLayout>
    );
  }

  if (error) {
    return (
      <FeedLayout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Alert variant="destructive">
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'You do not have permission to view analytics for this event.'}
            </AlertDescription>
          </Alert>
        </div>
      </FeedLayout>
    );
  }

  if (!event || !analytics) {
    return (
      <FeedLayout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Alert>
            <AlertTitle>Event not found</AlertTitle>
            <AlertDescription>
              The event you're looking for doesn't exist or has been deleted.
            </AlertDescription>
          </Alert>
        </div>
      </FeedLayout>
    );
  }

  return (
    <FeedLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`/dna/convene/events/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Button>
        </div>

        <EventAnalyticsCard analytics={analytics} eventTitle={event.title} />
      </div>
    </FeedLayout>
  );
};

export default EventAnalytics;

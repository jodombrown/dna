import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import EventDetail from './EventDetail';
import { Loader2 } from 'lucide-react';

const EventBySlug: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { enabled: eventsV2Enabled, loading: flagLoading } = useFeatureFlag('DNA_EVENTS_V2');
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchEventBySlug = async () => {
      if (!slug || flagLoading) return;

      try {
        const { data, error } = await supabase
          .from('events')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          console.error('Error fetching event by slug:', error);
          setNotFound(true);
        } else if (data) {
          setEventId(data.id);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEventBySlug();
  }, [slug, flagLoading]);

  if (flagLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
        <p className="text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  if (!eventId) {
    return <Navigate to="/app/events" replace />;
  }

  // For now, redirect to ID-based route since we haven't implemented v2 layout yet
  // When v2 is fully implemented, we'll render the v2 layout here if flag is enabled
  return <Navigate to={`/app/events/${eventId}`} replace />;
};

export default EventBySlug;
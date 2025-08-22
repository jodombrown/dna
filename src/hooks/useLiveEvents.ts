import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LiveEvent {
  id: string;
  title: string;
  description?: string;
  date_time?: string;
  location?: string;
  type?: string;
  attendee_count?: number;
  max_attendees?: number;
  is_featured?: boolean;
  is_virtual?: boolean;
  created_at: string;
  created_by: string;
}

export const useLiveEvents = (limit: number = 10) => {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .order('date_time', { ascending: true })
          .limit(limit);

        if (fetchError) {
          console.error('Error fetching events:', fetchError);
          setError(fetchError.message);
          toast({
            title: "Error",
            description: "Failed to load events",
            variant: "destructive",
          });
          return;
        }

        setEvents(data || []);
      } catch (err: any) {
        console.error('Unexpected error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [limit, toast]);

  return { events, loading, error, refetch: () => window.location.reload() };
};
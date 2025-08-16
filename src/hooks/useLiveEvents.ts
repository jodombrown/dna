import { useEffect, useState } from "react";

export type EventLite = { 
  id: string; 
  title: string; 
  date_time: string; 
  location?: string;
  is_virtual?: boolean;
  type?: string;
  attendee_count?: number;
};

export const useLiveEvents = (limit?: number) => {
  const [events, setEvents] = useState<EventLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Replace with real Supabase query when ready:
  useEffect(() => {
    // Example placeholder for future fetch:
    // supabase.from('events').select('id,title,date_time,location').gte('date_time', new Date().toISOString()).then(...)
    setEvents([]);
    setLoading(false);
    setError(null);
  }, []);

  return { events, loading, error, refetch: () => setEvents([]) };
};
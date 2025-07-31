
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/search';

export const searchEvents = async (searchTerm: string = '', filters: any = {}): Promise<Event[]> => {
  console.log('Searching events with term:', searchTerm, 'and filters:', filters);
  
  let query = supabase.from('events').select('*');
  
  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.trim();
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,type.ilike.%${term}%,location.ilike.%${term}%`);
  }
  
  if (filters.type) {
    query = query.eq('type', filters.type);
  }
  
  if (filters.is_virtual !== undefined) {
    query = query.eq('is_virtual', filters.is_virtual);
  }
  
  if (filters.upcoming_only) {
    query = query.gte('date_time', new Date().toISOString());
  }
  
  const { data, error } = await query.order('date_time', { ascending: true });
  
  if (error) {
    console.error('Events search error:', error);
    throw error;
  }
  
  console.log('Events search results:', data?.length || 0, 'events found');
  return data || [];
};

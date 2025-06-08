
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/search';

export const searchEvents = async (searchTerm: string = '', filters: any = {}): Promise<Event[]> => {
  let query = supabase.from('events').select('*');
  
  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
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
  
  if (error) throw error;
  return data || [];
};

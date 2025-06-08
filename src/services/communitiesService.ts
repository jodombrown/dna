
import { supabase } from '@/integrations/supabase/client';
import { Community } from '@/types/search';

export const searchCommunities = async (searchTerm: string = '', category?: string): Promise<Community[]> => {
  let query = supabase.from('communities').select('*');
  
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query.order('member_count', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

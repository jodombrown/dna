
import { supabase } from '@/integrations/supabase/client';
import { Professional } from '@/types/search';

export const searchProfessionals = async (searchTerm: string = '', filters: any = {}): Promise<Professional[]> => {
  let query = supabase.from('professionals').select('*');
  
  if (searchTerm) {
    query = query.or(`full_name.ilike.%${searchTerm}%,profession.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
  }
  
  if (filters.expertise && filters.expertise.length > 0) {
    query = query.overlaps('expertise', filters.expertise);
  }
  
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  
  if (filters.is_mentor !== undefined) {
    query = query.eq('is_mentor', filters.is_mentor);
  }
  
  if (filters.is_investor !== undefined) {
    query = query.eq('is_investor', filters.is_investor);
  }
  
  if (filters.looking_for_opportunities !== undefined) {
    query = query.eq('looking_for_opportunities', filters.looking_for_opportunities);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

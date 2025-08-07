// V1 Supabase hooks - Legacy data access
import { supabase } from '@/integrations/supabase/client';

export const useV1Data = () => {
  // Legacy v1 queries without version filtering for now
  const fetchV1Posts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  };

  const fetchV1Users = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    return { data, error };
  };

  return {
    fetchV1Posts,
    fetchV1Users,
  };
};
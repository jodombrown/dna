// V1 Supabase hooks with version filtering
import { supabase } from '@/integrations/supabase/client';

export const useV1Data = () => {
  // All v1 queries should include version_tag: 'v1' filter
  const fetchV1Posts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('version_tag', 'v1')
      .order('created_at', { ascending: false });
    
    return { data, error };
  };

  const fetchV1Users = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('version_tag', 'v1');
    
    return { data, error };
  };

  return {
    fetchV1Posts,
    fetchV1Users,
  };
};
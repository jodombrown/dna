import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LiveContribution {
  id: string;
  title: string;
  description?: string;
  contribution_type: string;
  impact_area?: string;
  amount_needed?: number;
  amount_raised?: number;
  target_date?: string;
  location?: string;
  status?: string;
  created_at: string;
  created_by: string;
  image_url?: string;
}

export const useLiveContributions = (limit: number = 10) => {
  const [contributions, setContributions] = useState<LiveContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('contribution_cards')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (fetchError) {
          setError(fetchError.message);
          toast({
            title: "Error",
            description: "Failed to load contribution opportunities",
            variant: "destructive",
          });
          return;
        }

        setContributions(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [limit, toast]);

  return { contributions, loading, error, refetch: () => window.location.reload() };
};
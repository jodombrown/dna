
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { toast } from 'sonner';

interface JobReferral {
  id: string;
  referrer_id: string;
  referred_id: string;
  job_id: string;
  note: string;
  status: string;
  created_at: string;
  job_posts: {
    title: string;
    company: string;
  };
  profiles: {
    full_name: string;
  };
}

export const useJobReferrals = () => {
  const { user } = useAuth();
  const [referralsMade, setReferralsMade] = useState<JobReferral[]>([]);
  const [referralsReceived, setReferralsReceived] = useState<JobReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch referrals made by the user
      const { data: made, error: madeError } = await supabase
        .from('job_referrals')
        .select(`
          *,
          job_posts!inner(title, company),
          profiles!job_referrals_referred_id_fkey(full_name)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (madeError) throw madeError;

      // Fetch referrals received by the user
      const { data: received, error: receivedError } = await supabase
        .from('job_referrals')
        .select(`
          *,
          job_posts!inner(title, company),
          profiles!job_referrals_referrer_id_fkey(full_name)
        `)
        .eq('referred_id', user.id)
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      setReferralsMade(made || []);
      setReferralsReceived(received || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching referrals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createReferral = async (jobId: string, referredUserId: string, note?: string) => {
    if (!user) {
      toast.error('You must be logged in to make referrals');
      return false;
    }

    try {
      const { error } = await supabase
        .from('job_referrals')
        .insert({
          referrer_id: user.id,
          referred_id: referredUserId,
          job_id: jobId,
          note: note || '',
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Referral sent successfully!');
      await fetchReferrals(); // Refresh the data
      return true;
    } catch (err: any) {
      console.error('Error creating referral:', err);
      toast.error('Failed to send referral');
      return false;
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [user]);

  return {
    referralsMade,
    referralsReceived,
    loading,
    error,
    createReferral,
    refetch: fetchReferrals,
  };
};

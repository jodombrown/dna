
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
  referrer_profile?: {
    full_name: string;
  };
  referred_profile?: {
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
          job_posts!inner(title, company)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (madeError) throw madeError;

      // Fetch referrals received by the user
      const { data: received, error: receivedError } = await supabase
        .from('job_referrals')
        .select(`
          *,
          job_posts!inner(title, company)
        `)
        .eq('referred_id', user.id)
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      // Now fetch profile names separately for the made referrals
      if (made && made.length > 0) {
        const referredIds = made.map(r => r.referred_id);
        const { data: referredProfiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', referredIds);

        const madeWithProfiles = made.map(referral => ({
          ...referral,
          referred_profile: referredProfiles?.find(p => p.id === referral.referred_id)
        }));
        setReferralsMade(madeWithProfiles);
      } else {
        setReferralsMade([]);
      }

      // Fetch profile names separately for the received referrals
      if (received && received.length > 0) {
        const referrerIds = received.map(r => r.referrer_id);
        const { data: referrerProfiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', referrerIds);

        const receivedWithProfiles = received.map(referral => ({
          ...referral,
          referrer_profile: referrerProfiles?.find(p => p.id === referral.referrer_id)
        }));
        setReferralsReceived(receivedWithProfiles);
      } else {
        setReferralsReceived([]);
      }

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

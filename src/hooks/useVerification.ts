import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface VerificationStatus {
  is_verified: boolean;
  verified_at?: string;
  impact_type?: string;
  score: number;
}

export const useVerificationStatus = (userId?: string) => {
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    is_verified: false,
    score: 0
  });
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  const fetchVerificationStatus = async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_adin_profile')
        .select('is_verified_contributor, contributor_verified_at, contributor_impact_type, contributor_score')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching verification status:', error);
        return;
      }

      if (data) {
        setVerificationStatus({
          is_verified: data.is_verified_contributor || false,
          verified_at: data.contributor_verified_at,
          impact_type: data.contributor_impact_type,
          score: data.contributor_score || 0
        });
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, [targetUserId]);

  return { verificationStatus, loading, refetch: fetchVerificationStatus };
};

export const useContributorRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('adin_contributor_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching contributor requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.id]);

  return { requests, loading, refetch: fetchRequests };
};
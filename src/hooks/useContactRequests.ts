
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { toast } from 'sonner';

export interface ContactRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  purpose: 'connect' | 'collaborate';
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  sender_profile?: {
    full_name: string;
    avatar_url?: string;
    profession?: string;
  };
  receiver_profile?: {
    full_name: string;
    avatar_url?: string;
    profession?: string;
  };
}

export const useContactRequests = () => {
  const { user } = useAuth();
  const [sentRequests, setSentRequests] = useState<ContactRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContactRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch sent requests
      const { data: sent, error: sentError } = await supabase
        .from('contact_requests')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      // Fetch received requests
      const { data: received, error: receivedError } = await supabase
        .from('contact_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      // Get profiles for sent requests (receivers)
      if (sent && sent.length > 0) {
        const receiverIds = sent.map(req => req.receiver_id);
        const { data: receiverProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, profession')
          .in('id', receiverIds);

        const sentWithProfiles = sent.map(req => ({
          ...req,
          purpose: req.purpose as 'connect' | 'collaborate',
          status: req.status as 'pending' | 'accepted' | 'declined',
          receiver_profile: receiverProfiles?.find(p => p.id === req.receiver_id)
        }));
        setSentRequests(sentWithProfiles);
      } else {
        setSentRequests([]);
      }

      // Get profiles for received requests (senders)
      if (received && received.length > 0) {
        const senderIds = received.map(req => req.sender_id);
        const { data: senderProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, profession')
          .in('id', senderIds);

        const receivedWithProfiles = received.map(req => ({
          ...req,
          purpose: req.purpose as 'connect' | 'collaborate',
          status: req.status as 'pending' | 'accepted' | 'declined',
          sender_profile: senderProfiles?.find(p => p.id === req.sender_id)
        }));
        setReceivedRequests(receivedWithProfiles);
      } else {
        setReceivedRequests([]);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching contact requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendContactRequest = async (
    receiverId: string, 
    purpose: 'connect' | 'collaborate', 
    message?: string
  ): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to send requests');
      return false;
    }

    try {
      const { error } = await supabase
        .from('contact_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          purpose,
          message: message || null
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('You already have a pending request with this user');
          return false;
        }
        throw error;
      }

      toast.success('Request sent successfully!');
      await fetchContactRequests();
      return true;
    } catch (err: any) {
      console.error('Error sending contact request:', err);
      toast.error('Failed to send request');
      return false;
    }
  };

  const respondToRequest = async (requestId: string, status: 'accepted' | 'declined'): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status })
        .eq('id', requestId)
        .eq('receiver_id', user.id);

      if (error) throw error;

      toast.success(`Request ${status} successfully!`);
      await fetchContactRequests();
      return true;
    } catch (err: any) {
      console.error('Error responding to request:', err);
      toast.error('Failed to respond to request');
      return false;
    }
  };

  const getPendingRequestsCount = () => {
    return receivedRequests.filter(req => req.status === 'pending').length;
  };

  useEffect(() => {
    fetchContactRequests();
  }, [user]);

  return {
    sentRequests,
    receivedRequests,
    loading,
    error,
    sendContactRequest,
    respondToRequest,
    getPendingRequestsCount,
    refetch: fetchContactRequests
  };
};

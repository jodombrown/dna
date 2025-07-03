
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NewsletterEmailStats {
  sent: number;
  total: number;
  emailSentAt?: string;
}

export const useNewsletterEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFollowerCount = async (userId: string): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('get_newsletter_followers', {
        newsletter_user_id: userId
      });

      if (error) throw error;
      return data?.length || 0;
    } catch (err: any) {
      console.error('Error getting follower count:', err);
      return 0;
    }
  };

  const sendNewsletterEmail = async (newsletterId: string): Promise<NewsletterEmailStats | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-newsletter-email', {
        body: { newsletterId }
      });

      if (error) throw error;

      toast.success(`Newsletter sent to ${data.sent} subscribers!`);
      
      return {
        sent: data.sent,
        total: data.total,
        emailSentAt: new Date().toISOString()
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send newsletter';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getNewsletterDeliveries = async (newsletterId: string) => {
    try {
      const { data, error } = await supabase
        .from('newsletter_deliveries')
        .select('*')
        .eq('newsletter_id', newsletterId);

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error getting newsletter deliveries:', err);
      return [];
    }
  };

  return {
    loading,
    error,
    sendNewsletterEmail,
    getFollowerCount,
    getNewsletterDeliveries
  };
};

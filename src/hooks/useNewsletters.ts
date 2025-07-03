import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';

interface Newsletter {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  is_published: boolean;
  publication_date: string;
  email_recipient_count: number;
  subscriber_count: number;
  created_at: string;
  tags: string[];
  featured_image_url: string;
  created_by: string;
}

export const useNewsletters = (showOnlyPublished = false) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });

      if (showOnlyPublished) {
        query = query.eq('is_published', true);
      } else if (user) {
        query = query.eq('created_by', user.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setNewsletters(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching newsletters:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch newsletters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewsletter = async (newsletterData: Omit<Newsletter, 'id' | 'created_at' | 'created_by' | 'email_recipient_count' | 'subscriber_count'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('newsletters')
        .insert({
          ...newsletterData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      // If publishing, track contribution
      if (newsletterData.is_published) {
        await supabase
          .from('contributions')
          .insert({
            user_id: user.id,
            type: 'newsletter',
            target_id: data.id,
            target_title: newsletterData.title
          });
      }
      
      await fetchNewsletters();
      return data;
    } catch (err: any) {
      console.error('Error creating newsletter:', err);
      throw err;
    }
  };

  const updateNewsletter = async (id: string, updates: Partial<Newsletter>) => {
    try {
      const { error } = await supabase
        .from('newsletters')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchNewsletters();
    } catch (err: any) {
      console.error('Error updating newsletter:', err);
      throw err;
    }
  };

  const deleteNewsletter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('newsletters')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setNewsletters(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      console.error('Error deleting newsletter:', err);
      throw err;
    }
  };

  const publishNewsletter = async (id: string) => {
    try {
      // Update newsletter to published
      await updateNewsletter(id, {
        is_published: true,
        publication_date: new Date().toISOString()
      });

      // Send emails to followers
      const { error: emailError } = await supabase.functions.invoke('send-newsletter', {
        body: { newsletterId: id }
      });
      
      if (emailError) throw emailError;

      toast({
        title: "Newsletter Published",
        description: "Your newsletter has been published and sent to followers",
      });
    } catch (err: any) {
      console.error('Error publishing newsletter:', err);
      toast({
        title: "Publishing Error",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, [user, showOnlyPublished]);

  return {
    newsletters,
    loading,
    error,
    createNewsletter,
    updateNewsletter,
    deleteNewsletter,
    publishNewsletter,
    refetch: fetchNewsletters
  };
};
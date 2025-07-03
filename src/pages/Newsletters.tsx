
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import Header from '@/components/Header';
import NewsletterCard from '@/components/newsletter/NewsletterCard';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';

interface Newsletter {
  id: string;
  title: string;
  summary?: string;
  content: string;
  created_by: string;
  created_at: string;
  is_published: boolean;
  email_sent_at?: string;
  email_recipient_count?: number;
  publication_date?: string;
}

const Newsletters = () => {
  const { user } = useAuth();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select(`
          *,
          profiles:created_by (
            full_name,
            avatar_url
          )
        `)
        .eq('is_published', true)
        .order('publication_date', { ascending: false });

      if (error) throw error;
      setNewsletters(data || []);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading newsletters...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-dna-emerald" />
              DNA Newsletters
            </h1>
            <p className="text-gray-600 mt-2">
              Stay updated with insights and stories from the African Diaspora community
            </p>
          </div>
          
          {user && (
            <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Newsletter
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {newsletters.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">No newsletters yet</h3>
              <p className="text-gray-400">Be the first to share your insights with the community!</p>
            </div>
          ) : (
            newsletters.map((newsletter: any) => (
              <NewsletterCard
                key={newsletter.id}
                newsletter={newsletter}
                author={newsletter.profiles}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Newsletters;

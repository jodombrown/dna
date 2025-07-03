
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RichContentItem {
  id: string;
  type: 'event' | 'initiative' | 'opportunity';
  title: string;
  created_at: string;
  created_by?: string;
  data: any; // The specific data for each content type
  author?: {
    full_name: string;
    avatar_url?: string;
    professional_role?: string;
  };
}

export const useRichContent = () => {
  const { toast } = useToast();
  const [richContent, setRichContent] = useState<RichContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRichContent = async () => {
    setLoading(true);
    try {
      // Fetch events with manual profile join
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (eventsError) throw eventsError;

      // Fetch initiatives with manual profile join
      const { data: initiativesData, error: initiativesError } = await supabase
        .from('initiatives')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (initiativesError) throw initiativesError;

      // Fetch opportunities - this might fail if table doesn't exist yet, so we'll handle it gracefully
      let opportunitiesData: any[] = [];
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (!error && data) {
          opportunitiesData = data;
        }
      } catch (error) {
        console.log('Opportunities table not ready yet:', error);
      }

      // Get all unique user IDs for profile fetching
      const allUserIds = [
        ...(eventsData || []).map(item => item.created_by).filter(Boolean),
        ...(initiativesData || []).map(item => item.creator_id).filter(Boolean),
        ...(opportunitiesData || []).map(item => item.created_by).filter(Boolean),
      ];

      const uniqueUserIds = [...new Set(allUserIds)];

      // Fetch profiles for all users
      let profilesMap: Record<string, any> = {};
      if (uniqueUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, professional_role')
          .in('id', uniqueUserIds);

        if (profilesData) {
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      // Combine and format all content
      const allContent: RichContentItem[] = [
        ...(eventsData || []).map(event => ({
          id: event.id,
          type: 'event' as const,
          title: event.title,
          created_at: event.created_at,
          created_by: event.created_by,
          data: event,
          author: event.created_by && profilesMap[event.created_by] ? {
            full_name: profilesMap[event.created_by].full_name || 'Unknown User',
            avatar_url: profilesMap[event.created_by].avatar_url || undefined,
            professional_role: profilesMap[event.created_by].professional_role || undefined
          } : undefined
        })),
        ...(initiativesData || []).map(initiative => ({
          id: initiative.id,
          type: 'initiative' as const,
          title: initiative.title,
          created_at: initiative.created_at,
          created_by: initiative.creator_id,
          data: initiative,
          author: initiative.creator_id && profilesMap[initiative.creator_id] ? {
            full_name: profilesMap[initiative.creator_id].full_name || 'Unknown User',
            avatar_url: profilesMap[initiative.creator_id].avatar_url || undefined,
            professional_role: profilesMap[initiative.creator_id].professional_role || undefined
          } : undefined
        })),
        ...(opportunitiesData || []).map(opportunity => ({
          id: opportunity.id,
          type: 'opportunity' as const,
          title: opportunity.title,
          created_at: opportunity.created_at,
          created_by: opportunity.created_by,
          data: opportunity,
          author: opportunity.created_by && profilesMap[opportunity.created_by] ? {
            full_name: profilesMap[opportunity.created_by].full_name || 'Unknown User',
            avatar_url: profilesMap[opportunity.created_by].avatar_url || undefined,
            professional_role: profilesMap[opportunity.created_by].professional_role || undefined
          } : undefined
        }))
      ];

      // Sort all content by creation date
      allContent.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRichContent(allContent);
    } catch (error) {
      console.error('Error fetching rich content:', error);
      toast({
        title: "Error",
        description: "Failed to load rich content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRichContent();
  }, []);

  return {
    richContent,
    loading,
    refreshContent: fetchRichContent
  };
};
